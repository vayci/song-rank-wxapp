const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatDate = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return [year, month, day].map(formatNumber).join('-') + ' 某个时刻'
}

function formatTimeStamp(number) {
  var data = new Date(number);
  return formatTime(data);
}
function formatTimeStampToDate(number) {
  var data = new Date(number);
  return formatDate(data);
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

const str2Date = str => {
  str = str.replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '').replace(/(-)/g, '/')
  str = str.slice(0, str.indexOf("."))
  return new Date(str)
}

module.exports = {
  formatTime: formatTime,
  formatTimeStamp: formatTimeStamp,
  formatTimeStampToDate: formatTimeStampToDate,
  str2Date: str2Date
}
