export function createTimeStr(dateObj1) {
    let dateObj = new Date(dateObj1)

    let month   = dateObj.getUTCMonth() + 1; // months from 1-12
    let day     = dateObj.getUTCDate();
    let year    = dateObj.getUTCFullYear();
    let hour    = dateObj.getUTCHours();
    let minute  = dateObj.getUTCMinutes();

    if(day < 10) {
        day = "0" + day
    }
    if(month < 10) {
        month = "0" + month
    }
    if(hour < 10) {
        hour = "0" + hour
    }
    if(minute < 10) {
        minute = "0" + minute
    }
    let timeStr = year + '-' + month + '-' + day + "T" + hour + ":" + minute + ":00.000Z"
    return timeStr
}