import { FilterDescriptor } from "@progress/kendo-data-query";
import { FieldSettings } from "@progress/kendo-react-data-tools";
import { DataTypes } from "./DataTypes";

export interface DataFilter extends FilterDescriptor {
  type: DataTypes;
}

export interface DataFieldSettings extends FieldSettings {
  type: DataTypes;
}

export interface RxDataFilter {
  name: string;
  value: any;
  type: DataTypes;
  operation: string;
}

export const CustomFilterOperators = {
  matchPhrase: function (a: any, b: any) {
    const words = (b || "").split(" ");
    return words.map((x: string) => (a || "").match(x) != null).every((x: boolean) => x);
  },

  match: function (a: any, b: any) {
    return (a || "").match(b) != null;
  },

  containsWithCase: function (a: any, b: any) {
    return (a || "").includes(b) != null;
  },

  in: function (a: any, b: any) {
    if (a == null || b == null) {
      return false;
    }
    if (Array.isArray(b) && !Array.isArray(a)) {
      return b.map((x) => `${x}`.toLowerCase()).includes(`${a}`.toLowerCase());
    }else if (Array.isArray(a)&& !Array.isArray(b)) {
      return a.map((x) => `${x}`.toLowerCase()).includes(`${b}`.toLowerCase());
    }else if (Array.isArray(a) &&  Array.isArray(b))
    {
        return isSubset(a, b);
    }

    if (typeof b === "string") {
      return `${a}`.toLowerCase() === `${b}`.toLowerCase();
    }
    if (typeof b === "number") {
      return a === b;
    }
    if (typeof b === "boolean") {
      return a === b;
    }
    if (typeof b === "object") {
      return a === b;
    }
    
    return false;
  },
};


function isSubset(a:any[], b:any[]) {

    // Create a hash set and insert all elements of a
    const hashSet = new Set(a);

    // Check each element of b in the hash set
    for (const num of b) {
        if (!hashSet.has(num)) {
            return false;
        }
    }

    // If all elements of b are found in the hash set
    return true;
}
/* SAMPLE Operator MAP
var operatorsMap = {
  contains: function (a, b) {
    return (a || "").indexOf(b) >= 0;
  },
  doesnotcontain: function (a, b) {
    return (a || "").indexOf(b) === -1;
  },
  doesnotendwith: function (a, b) {
    return (a || "").indexOf(b, (a || "").length - (b || "").length) < 0;
  },
  doesnotstartwith: function (a, b) {
    return (a || "").lastIndexOf(b, 0) === -1;
  },
  endswith: function (a, b) {
    return (a || "").indexOf(b, (a || "").length - (b || "").length) >= 0;
  },
  eq: function (a, b) {
    return a === b;
  },
  gt: function (a, b) {
    return a > b;
  },
  gte: function (a, b) {
    return a >= b;
  },
  isempty: function (a) {
    return a === '';
  },
  isnotempty: function (a) {
    return a !== '';
  },
  isnotnull: function (a) {
    return isPresent(a);
  },
  isnull: function (a) {
    return isBlank(a);
  },
  lt: function (a, b) {
    return a < b;
  },
  lte: function (a, b) {
    return a <= b;
  },
  neq: function (a, b) {
    return a != b;
  },
  startswith: function (a, b) {
    return (a || "").lastIndexOf(b, 0) === 0;
  }
}; */
