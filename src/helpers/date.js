const moment = require("moment");

function getDate(date) {
    return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`
}

function addHourToDate(date, hour, incrementHour) {
    const time = 60 * 60 * 1000
    let dateTime = date.getTime()
    if (incrementHour) {
        return dateTime + ((hour + incrementHour) * time)
    }
    return dateTime + (hour * time)
}

function getDateBasedFormat(unixTime, format, keeplocal = false) {
    if(keeplocal) {
        return moment(unixTime ).tz('Asia/Jakarta').locale('id').format(format)
    }
    return moment.unix(unixTime / 1000).utc().local(keeplocal).locale('id').format(format)
}

module.exports = {getDate, addHourToDate, getDateBasedFormat}