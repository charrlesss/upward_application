import { format } from "date-fns"

export function defaultFormat(date: Date) {
    const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx");
    return formattedDate
}