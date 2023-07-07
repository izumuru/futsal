const {sequelize} = require('../models')
const {QueryTypes} = require('sequelize');
const {getDateBasedFormat} = require("../helpers/date");

async function income(request, response) {
    const incomesByMonth = await sequelize.query("SELECT \n" +
        "\tsum(total_price) as total_all,\n" +
        "\tsum(day_price) as total_day,\n" +
        "\tsum(night_price) as total_night,\n" +
        "\tsum(admin_price) as total_admin,\n" +
        "\tDATE_TRUNC('month', \"updatedAt\") as income_month\n" +
        "\tFROM public.\"Bookings\"\n" +
        "WHERE\n" +
        "\tstatus_bayar = 'paid'\n" +
        "GROUP BY\n" +
        "\tDATE_TRUNC('month', \"updatedAt\")\n" +
        "ORDER BY\n" +
        "\tincome_month DESC\n" +
        "LIMIT 6", {type: QueryTypes.SELECT})
    return response.status(200).json({
        status: 200,
        data: incomesByMonth.map(value => {
            const month = getDateBasedFormat(value.income_month.getTime(), "MMM YYYY")
            const {total_all, total_day, total_night, total_admin} = value
            return {[month]: {total_all, total_day, total_night, total_admin}}
        })
    })
}


async function rentTime(request, response) {
    const rentTimeByMonth = await sequelize.query("SELECT \n" +
        "\t(sum(day_price_quantity) + sum(night_price_quantity)) as total,\n" +
        "\tDATE_TRUNC('month', booking_date) as month_play\n" +
        "FROM \n" +
        "\tpublic.\"Bookings\"\n" +
        "WHERE\n" +
        "\tstatus_bayar = 'paid'\n" +
        "GROUP BY\n" +
        "\tDATE_TRUNC('month', booking_date)\n" +
        "ORDER BY\n" +
        "\tmonth_play\n" +
        "LIMIT 6", {type: QueryTypes.SELECT})
    const month = rentTimeByMonth.map((value) => {
        return value.month_play.getMonth() + 1
    }).join(',')
    if(month.length === 0) return response.status(200).json({status: 200, data: []})
    const specificTime = await sequelize.query("SELECT \n" +
        "    booking_time,\n" +
        "\tday_price_quantity,\n" +
        "\tnight_price_quantity,\n" +
        "\tDATE_TRUNC('month', booking_date) play_month\n" +
        "FROM \n" +
        "\tpublic.\"Bookings\"\n" +
        "WHERE\n" +
        "\tstatus_bayar = 'paid' AND" +
        `\tEXTRACT(MONTH from booking_date) IN (${month})\n` +
        "ORDER BY\n" +
        "\tplay_month DESC", {type: QueryTypes.SELECT})
    const obj = {}
    let monthResult = null;
    specificTime.forEach(value => {
        const month = getDateBasedFormat(value.play_month.getTime(), "MMM YYYY")
        if(monthResult === null || monthResult !== month) {
            console.log(obj);
            monthResult = month
            obj[monthResult] = []
            for(let i = 0; i < 24; i++) obj[monthResult][i] = 0
        }
        const time = +value.booking_time.split(':')[0]
        const duration = value.day_price_quantity ?? 0 + value.night_price_quantity ?? 0
        for(let i = time; i < time + duration; i++) {
            obj[month][i-1]++;
        }
    })
    Object.keys(obj).map(value => {
        obj[value] = obj[value].map((value, index) => {
            if(value === 0) return undefined
            return {
                time: `${String(index+1).padStart(2, '0')}:00-${String(index+2).padStart(2, '0')}:00`,
                total: value
            }
        }).filter(value => value !== undefined).sort((a, b) => a.total - b.total).reverse()
    })
    let dataResult = Object.keys(obj).map(key => {
        return {
            [key]: obj[key],
            total_time_rent: 0,
        }
    });
    const keys = dataResult.map(value => Object.keys(value)[0]);
    rentTimeByMonth.forEach(value => {
        const month = getDateBasedFormat(value.month_play.getTime(), "MMM YYYY")
        const findIndex = keys.indexOf(month);
        dataResult[findIndex].total_time_rent = value.total;
    })
    return response.status(200).json({
        status: 200,
        data: dataResult
    })
}

module.exports = {income, rentTime}