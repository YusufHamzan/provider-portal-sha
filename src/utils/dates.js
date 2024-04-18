import moment from "moment";

export function toDate(date) {
  return moment(date).format('DD/MM/YYYY');
}