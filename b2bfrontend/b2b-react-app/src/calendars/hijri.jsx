import arabic from "react-date-object/calendars/arabic";
import gregorian from  "react-date-object/calendars/gregorian";
import { getMonthLengthYear } from "./monthlength";
import { gregorianToHijri ,hijriToGregorian} from '@tabby_ai/hijri-converter';
import DateObject from "react-date-object";





const hijri = {
    name: "hijri",
    startYear: 1343,
    yearLength: arabic.yearLength,
    epoch: arabic.epoch,
    century: arabic.century,
    weekStartDayIndex: arabic.weekStartDayIndex,
    getMonthLengths(isLeap) {
        console.log("getMonthLengths");
      const selectedYear = localStorage.getItem("selectedYear");
        let result =getMonthLengthYear(selectedYear);
      

      return result;
    },
    isLeap(year) {
        console.log("isLeap");
      return arabic.isLeap(year);
    },
    getLeaps(currentYear) {
        console.log("getLeaps");
return arabic.getLeaps(currentYear);
    },
    getDayOfYear({ year, month, day }) {
        console.log("getDayOfYear %d, %d, %d" , year,month,day );
        return arabic.getDayOfYear(year,month,day);
    },
    getAllDays(date) {
      const gregorianDate = hijriToGregorian({"year" :date.year, "month" : date.month.index + 1,"day" : date.day });
      
      let d = new DateObject(gregorianDate.year,gregorianDate.month,gregorianDate.day);
  
const daysSinceEpoch =  gregorian.getAllDays(d) ;

     
     console.log("getAllDays %d" , daysSinceEpoch );
     return daysSinceEpoch -207103;
    },
    leapsLength(year) {
      return arabic.leapsLength(year);
    },
    guessYear(days, currentYear) {
        console.log("guessYear %d %d" , days , currentYear );
      
       let y = arabic.guessYear(days,currentYear);
       localStorage.setItem("selectedYear" ,y);
       return y;
    },
  };
  
  export default hijri;


//return new Intl.DateTimeFormat('ar-SA', options)