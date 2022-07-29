import xreg from "xregexp";

function makeRegex(regTab, regex, word) {
  console.log(regTab);
  const words = ["AT_END",
  "HAVE_EXACT" ,
  "MATCH_SEQUENCE",
  "HAVE_MAYBE_LOT",
  "HAVE_SURE",
  "HAVE_MAYBE_ONE",
  "AT_START",
  "NOTSPACE",
  "WORDS_WITH",
"WORDS_START_WITH",
"WORDS_END_WITH",
"SEQUENCE",];
  if (regTab.length === 1) {
    if (word === "AT_END") {
      return `${regex}${regTab[0]}$`;
    }
    if (word === "HAVE_MAYBE_LOT") {
      return `${regex}${regTab[0]}*`;
    }
    if (word === "=") {
      return regTab[0];
    }
    if(word === "AT_START"){
        return `^${regex}${regTab[0]}`;
    }
    if(word === "HAVE_SURE"){
        return `${regex}${regTab[0]}+`;
    }
    if(word === "HAVE_MAYBE_ONE"){
        return `${regex}${regTab[0]}?`;
    }
    if (word === "NOTSPACE"){
        return `${regex}\\S`;
    }
    if(word === "HAVE_EXACT"){
        return `${regex}${regTab[0]}`;
    }
    if(word === "MATCH_SEQUENCE"){
        const a = regTab[0].split(",")
        return `${regex}${a[1]}{${a[0]}}`;
    }
    if(word === "SEQUENCE"){
      const a = regTab[0].split(",")
      const str = `\\S*\\s*`
      return `${regex}${a[0]}${str.repeat(a[2])}${a[1]}`;
  }
    if(word === "WORDS_WITH"){
        return `${regex}\\S*${regTab[0]}\\S*`;
    }
    if(word === "WORDS_START_WITH"){
        return `${regex}${regTab[0]}\\S*`;
    }
    if(word === "WORDS_END_WITH"){
        return `${regex}\\S*${regTab[0]}`;
    }
    if(word === "WORD_WITHIN"){
      const a = regTab[0].split(",")
      const str1 = `\\S*\\s*`
      const str2 = `\\s*\\S*`
      return `${regex}${str2.repeat(a[1])}${a[0]}${str1.repeat(a[1])}`;
    
  }




    return;
  } else {
    let count = 1;
    let ide = 0
    let newRegTab = [];
    let skip = true;
    let skiptwice = false
    let rege = "";
    regTab.map((re,id) => {
      if (!skip && !skiptwice) {
        if (words.includes(re)) {
          count += 1;
        }
        if (re === ")") {
          count -= 1;
        }
        if (count === 0) {
          let truc = newRegTab; 
          newRegTab = [];
          skip = true;
          count = 1;
          rege += makeRegex(truc, regex, regTab[ide]);

          if(words.includes(truc[id+2])){
            skiptwice = true
            ide = id+2
          }
          else{
            ide = id+1
          }
          return
        }
        newRegTab.push(re);
      }
      if (skip) {
        skip = !skip;
      }
      if(!skip && skiptwice){
        skiptwice = false
      }
    });
    console.log(rege)
    return makeRegex([rege],regex,word)

  }
}

const lightRegexCode = function ({ lightRegex }) {
  let regex = lightRegex.split(")");
  let regTab = [];
  regex.map((reg, id) => {
    regTab.push(reg);
    if (id !== regex.length - 1) {
      regTab.push(")");
    }
  });
  regex = [];
  regTab.map((re) => {
    if (re !== "") {
      regex.push(re);
    }
  });
  regTab = [];
  regex.map((re) => {
    re.split("(").map((r) => regTab.push(r));
  });
  regex = "";
  regex = makeRegex(regTab, regex,"=");
  return { Regex: regex };
};

const lightRegex = {
  name: "lightRegex",
  type: "Transform",
  description: "Light regex -> xregexp expression",
  inputs: [
    {
      name: "lightRegex",
      type: "text",
      source: "",
    },
  ],
  outputs: [
    {
      name: "Regex",
      type: "text",
    },
  ],
  code: lightRegexCode,
};

export default lightRegex;
