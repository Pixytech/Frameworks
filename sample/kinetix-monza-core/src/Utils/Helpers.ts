import { IDocument } from "@kinetix/idp-core";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
import { get } from "lodash";

export class Helpers {
  public static dependentFieldHasValue =
    (field: string, not: boolean = false) =>
    (valueGetter: any) => {
      return not ? !valueGetter(field) : valueGetter(field);
    };

  public static getCompositeKey(item: any, index: number, primaryKeys?: string[]): string {
    if (primaryKeys && primaryKeys.length > 0) {
      return primaryKeys.map((key) => get(item, key, `${key}-${index}`)).join("-");
    } else {
      return index.toString();
    }
  }

  public static serializeObject(data: any): string {
    return JSON.stringify(data);
  }

  public static deserializeObject<TType>(data: string): TType {
    const jsonObject = JSON.parse(data) as TType;
    return jsonObject;
  }

  public static localeDate(value: string): string {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    return dayjs(value).utc(false).toDate().toLocaleDateString();
  }

  public static localeDateAndTime(value: string): string {
    dayjs.extend(utc);
    dayjs.extend(timezone);

    return dayjs(value).utc(false).format("MMM / DD / YYYY hh:mm:ss A");
  }

  public static timeFrom(value: string): string {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    dayjs.extend(relativeTime);

    return dayjs(value).utc(false).fromNow();
  }

  public static jsonToFlatternText(context: any[]): string {
    let array = typeof context != "object" ? JSON.parse(context) : context;
    let str = "";

    for (let item of array) {
      let line = "";
      for (let index in item) {
        if (line != "") line += "\t";
        line += item[index];
      }
      str += line + "\r\n";
    }

    return str.replace(/\r\n$/, "");
  }

  public static localeDateTime(dateTime: string,format: string = "YYYY-MM-DD HH:mm:ss"): string {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const date_time = new Date(dateTime);
    return `${date_time.toLocaleDateString()} ${date_time.toLocaleTimeString()}`;
  }

  public static formatDate(value: Date, format: string = "YYYY-MM-DD"): string {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    const utcDate = dayjs(value).format(format);
    return utcDate;
  }

  public static formatDateTime(value: Date, format: string = "YYYY-MM-DD HH:mm:ss.SSS UTC"): string {
    dayjs.extend(utc);
    dayjs.extend(timezone);
    //2016-11-30 18:24:17.277 UTC
    const utcDate = dayjs(value).utc().format(format);
    return utcDate;
  }

  public static parseDate(value: string, format: string = "YYYY-MM-DD",keepLocalTime:boolean = false): Date {
    dayjs.extend(utc);
    dayjs.extend(customParseFormat);
    const date = dayjs(value, format).utc(keepLocalTime);
    return date.toDate();
  }

  public static parseDateTime(value: string, format: string = "YYYY-MM-DD HH:mm:ss.SSS UTC",keepLocalTime:boolean = false): Date {
    dayjs.extend(utc);
    dayjs.extend(customParseFormat);
    const date = dayjs(value, format).utc(keepLocalTime);
    return date.toDate();
  }

  public static areDatesEqual(valueA: Date, valueB: Date): boolean {
    return dayjs(valueA).isSame(valueB, "day");
  }
}
