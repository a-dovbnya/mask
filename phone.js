"use strict";
(function ($) {
    var lMaskMethods = {
        init: function (obj) {

            var $self = $(this);
            var param = new initParam();
            $self.val("");

            // Если маска передана при инициализации и её длина больше 6 символов (минимальная длина номера)
            if( obj["mask"].length >= 6 ){
                param.activeMask = obj["mask"];

                //this.limitSymbol = count;
                param.limitSymbol = obj["mask"].length;

                // Определим начало строки - до первого x
                param.startOfPattern = param.setStartOfPattern();

                // Обработаем активную маску таким образом, чтобы числовые символы заменить на x
                param.setProcessingMask();

            }

            /*$self.on("paste", function(e){
             console.log(e);
             });*/
            // get char code
            $self.on("keypress", function (e) {
                var textComponent;
                var selectedText;
                var startPos;
                var endPos;

                param.charCode = e.charCode;
                param.charSymbol = String.fromCharCode(e.charCode);

                if (param.checkSymbol(e.charCode)) {
                    textComponent = e.target;
                    selectedText = "";

                    if (textComponent.selectionStart !== undefined) {
                        startPos = textComponent.selectionStart;
                        endPos = textComponent.selectionEnd;
                        selectedText = textComponent.value.substring(startPos, endPos);
                        param.startPos = startPos;
                    }
                    if (selectedText.length > 0) {
                        if (selectedText.length === param.formattedVal.length) {
                            param.val = "";
                            param.formattedVal = "";
                        } else {
                            param.selectedSubstr = selectedText;
                            param.endPos = endPos;
                        }

                    }
                }

            });

            // interception delete and backspace button
            $self.on("keydown", function (e) {
                // delete
                if (e.keyCode === 46) {
                    var startPos;
                    var endPos;
                    var caretPos;
                    var symb;

                    textComponent = e.target;
                    selectedText = "";

                    if (textComponent.selectionStart !== undefined) {
                        startPos = textComponent.selectionStart;
                        endPos = textComponent.selectionEnd;
                        selectedText = textComponent.value.substring(startPos, endPos);

                        if (selectedText.length > 0) {
                            // run deleted substr
                            param.deleteSubstr(selectedText, startPos, endPos - startPos);
                        } else {
                            caretPos = param.getCaretPos(e.target);
                            symb = param.formattedVal[caretPos];

                            if (symb !== "-" || symb !== "(" || symb !== ")") {

                                param.deleteSymbol(caretPos, true);
                                param.formattedVal = param.strFormatted(param.val, param.processingMask);

                                if (param.formattedVal !== false) {
                                    param.charCode = 0;
                                    param.charSymbol = 0;
                                }

                            }

                            param.caretMoveFlag = true;
                            param.caretPos = caretPos;
                            param.caretMoveUp = true;

                        }
                    }
                    // backspace
                } else if (e.keyCode === 8) {
                    console.log("backspace");
                    // backspace
                    // selected text
                    var textComponent = e.target;
                    var selectedText;

                    if (textComponent.selectionStart !== undefined) {
                        startPos = textComponent.selectionStart;
                        endPos = textComponent.selectionEnd;
                        selectedText = textComponent.value.substring(startPos, endPos);
                    }
                    // selected text
                    if (selectedText.length > 0) {
                        // run delete substr
                        param.deleteSubstr(selectedText, startPos, endPos - startPos);
                    } else {
                        console.log("no selected text");
                        // delete symbol before caret
                        caretPos = param.getCaretPos(e.target);
                        symb = param.formattedVal[caretPos - 1];

                        if (symb === "-" || symb === "(" || symb === ")") {

                            param.charCode = 0;
                            param.charSymbol = 0;

                        } else {

                            param.deleteSymbol(caretPos);
                            param.formattedVal = param.strFormatted(param.val, param.processingMask);

                            if (param.formattedVal !== false) {
                                param.charCode = 0;
                                param.charSymbol = 0;
                                // output
                                //$self.val(param.formattedVal);
                            }

                        }
                        param.caretMoveFlag = true;
                        param.caretPos = caretPos;
                    }
                }
            });

            $self.on("input", function (e) {

                var charCode = param.charCode;
                var charSymbol = param.charSymbol;
                var index;

                param.currentVal = $self.val();

                console.log(param);

                if (charCode !== 0) {

                    //if (param.val.length === 0) {
                    if (param.currentVal.length <= param.startOfPattern.length) {

                        // it is first char
                        if (param.checkSymbol(charCode, true)) {

                            // Выбираем маску, если она не выбрана
                            if( !param.activeMask.length ) {
                                param.activeMask = param.defaultMask;
                                //param.selectMask(charCode);
                            }
                            param.formattedVal = true;

                            if( param.currentVal === "8" ){
                                param.currentVal = "+7("
                            }
                            if(param.currentVal === "9" && param.startOfPattern === "+7("){
                                param.val = "+7(9";
                            }

                            if(param.startOfPattern.indexOf(param.currentVal) != -1){
                                // Первый введённый символ встречается в начале шиблона
                                // Ввод этого символа можно разрешить

                                // Если позиция найденного символа != 0, то выводим все начало шаблона
                                // Как в случае +7(
                                if( param.startOfPattern.indexOf(param.currentVal) === 0 ){
                                    // Вводим первый символ
                                    param.val = param.currentVal;
                                }else{
                                    // Вводим начало шаблона
                                    param.val = param.startOfPattern;
                                }

                            }else if( param.startOfPattern.length === 0 ){
                                param.val = param.currentVal;
                            }

                        }

                    } else if (param.val.length < param.limitSymbol && param.selectedSubstr.length === 0) {
                        // is not first char
                        if (param.checkSymbol(charCode)) {

                            //if ((param.val.length === 1 && charCode === 57) || param.val.length > 1) {
                            if (param.val.length === 1 || param.val.length > 1) {

                                if (param.startPos === param.formattedVal.length) {
                                    param.val += String(charSymbol);
                                } else {

                                    if (param.val.length !== param.limitSymbol) {
                                        param.insertSymbol();
                                        param.caretMoveFlag = true;
                                        param.caretPos = param.startPos;
                                        param.caretMoveUp = true;
                                    }
                                }

                            }else{
                                param.val += String(charSymbol);
                            }

                        } else {
                            // if input first symbol and it is not number
                            $self.val("");
                        }

                    }

                    if (param.val.length <= param.limitSymbol && param.selectedSubstr.length > 0 && param.checkSymbol(charCode)) {
                        // replace selected text
                        param.deleteSubstr(param.selectedSubstr, param.startPos, param.endPos - param.startPos, String(param.charSymbol));
                    }

                    if (param.val === undefined) {
                        param.val = "";
                    }
                    //console.log("formattedVal = ", param.formattedVal);
                    param.formattedVal = param.strFormatted(param.val, param.processingMask);
                    param.val = param.formattedVal;

                    //onsole.log("formattedVal = ", param.formattedVal);

                    if (param.formattedVal !== false) {
                        $self.val(param.formattedVal);
                    } else {
                        if (param.charCode !== 43) {
                            param.formattedVal = "";
                            $self.val(param.formattedVal);
                        }

                    }
                    //param.currentVal = param.formattedVal;
                } else if (param.formattedVal.length !== 0) {

                    if (param.formattedVal === false) {
                        param.formattedVal = "";
                    }

                    //$self.val(param.formattedVal);
                    param.currentVal = param.formattedVal;
                }

                if( param.currentVal.length > param.activeMask.length ){
                    param.currentVal = param.formattedVal;
                }
                //param.currentVal = param.formattedVal;

                // move cursor for "-()" symbols
                if (param.caretMoveFlag) {
                    $self.val(param.formattedVal);

                    console.log("caret Move");
                    if (param.caretPos > 0) {
                        if (param.caretMoveUp) {
                            e.target.setSelectionRange(param.caretPos + 1, param.caretPos + 1);
                        } else {
                            e.target.setSelectionRange(param.caretPos - 1, param.caretPos - 1);
                        }

                        param.caretMoveFlag = false;
                        param.caretPos = 0;
                        param.caretMoveUp = false;

                    }

                }

            });

        }
    };
    var initParam = function () {
        return {
            //maskOne: "+x (xxx) xxx-xx-xx",
            //maskTwo: "+7 (xxx) xxx-xx-xx",
            //maskThree: "x (xxx) xxx-xx-xx",
            //maskFour: "(xxx) xxx-xx-xx",
            //maskFive: "+xxxxxxxxxxxx",
            defaultMask: "+7 (xxx) xxx-xx-xx",
            activeMask: "",
            processingMask: "",
            allowSymbolsArray: [],
            allowCharCode: [48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
            allowCharCodeFirst: [40, 41, 43],
            charCode: 0,
            charSymbol: 0,
            // Текущее значение поля ввода
            currentVal: "",
            val: "",
            // Текущая строка вводимых символов
            inputString: "",
            caretMoveFlag: false,
            caretPos: 0,
            caretMoveUp: false,
            formattedVal: "",
            selectedSubstr: "",
            startOfPattern: "",
            startPos: 0,
            endPos: 0,
            limitSymbol: 11,
            checkSymbol: function (symbol, first) {

                if (symbol) {
                    var flag = false;
                    //var backSpace = false;
                    var i;
                    for (i = 0; i < this.allowCharCode.length; i += 1) {
                        if (symbol === this.allowCharCode[i]) {
                            flag = true;
                            return flag;
                        }
                    }

                    var j;
                    if (first) {
                        for (j = 0; j < this.allowCharCodeFirst.length; j += 1) {
                            if (symbol === this.allowCharCodeFirst[j]) {
                                flag = true;
                            }
                        }
                    }

                    return flag;
                }
            },
            selectMask: function (symbol) {
                if (symbol === 43 || symbol === 55 || symbol === 56 || symbol === 57) {
                    //console.log("Маска ещё не выбрана");
                    this.activeMask = this.maskOne;
                    this.limitSymbol = 11;
                    this.val += "7";
                }
            },
            strFormatted: function (str, pattern) {

                /*if (str.length > 0 && pattern.length > 0) {

                    var result = "";
                    var cnt = 0;
                    var i;
                    for (i = 0; i < pattern.length; i += 1) {
                        if(str[i] === pattern[i] || pattern[i] === "x"){
                            if (str[cnt] !== undefined) {
                                result += str[cnt];
                                cnt += 1;
                            } else {
                                break;
                            }
                        }else{
                            result += pattern[i];
                        }
                    }
                    return result;
                } else {
                    return false;
                }*/
                if (str.length > 0 && pattern.length > 0) {

                    var result = "";
                    var i;
                    var allowSymbolsArray = this.allowSymbolsArray;

                    for (i = 0; i < pattern.length; i += 1) {
                        if( pattern[i] === "x" ){
                            if (str[i] !== undefined) {
                                /*
                                *** Проверяем, есть ли ограничение на конкретный символ
                                */
                                if( allowSymbolsArray.length ){
                                    for( var j = 0; j < allowSymbolsArray.length; j++){
                                        if(allowSymbolsArray[j].pos === i && str[i] !== allowSymbolsArray[j].allow){
                                            return result;
                                        }
                                    }

                                }

                                result += str[i];

                            } else {
                                break;
                            }
                        }else{
                            result += pattern[i];
                        }
                    }
                    return result;
                } else {
                    return false;
                }

            },
            getCaretPos: function (obj) {
                // return cursor position in string
                if (obj.selectionStart) {
                    return obj.selectionStart;
                } else if (document.selection) {
                    obj.focus();
                    var r = document.selection.createRange();
                    if (r === null) {
                        return 0;
                    }
                    var re = obj.createTextRange();
                    var rc = re.duplicate();
                    re.moveToBookmark(r.getBookmark());
                    rc.setEndPoint("EndToStart", re);
                    return rc.text.length;
                }
                return 0;
            },
            deleteSymbol: function (pos, del) {
                console.log("delete symbol");
                console.log("pos = ", pos);
                console.log("del = ", del);
                /*if (this.activeMask.length > 0) {
                 var strArr = this.activeMask.split("");
                 var newPos = 0;
                 var i;
                 for (i = 0; i < pos; i += 1) {
                 if (strArr[i] === "x") {
                 newPos += 1;
                 }
                 if (pos === 0) {
                 break;
                 }
                 }

                 var arrVal = this.val.split("");
                 var rezVal = "";

                 if (del) {
                 arrVal.splice(newPos, 1);
                 } else {
                 arrVal.splice(newPos - 1, 1);
                 }
                 for (i = 0; i < arrVal.length; i += 1) {
                 rezVal += arrVal[i];
                 }

                 this.val = rezVal;
                 }*/
                //this.val = this.currentVal;
                var arrVal = this.val.split("");
                var rezVal = "";
                if (del) {
                    arrVal.splice(newPos, 1);
                } else {
                    console.log(arrVal[pos - 1]);
                    if( !isNaN(parseInt(arrVal[pos - 1])) ) {
                        arrVal.splice(pos - 1, 1);
                    }
                    rezVal = rezVal.join("");
                    /*for (var i = 0; i < arrVal.length; i += 1) {
                        rezVal += arrVal[i];
                    }*/
                    console.log("rezVal = ", rezVal);
                    this.val = rezVal;
                }

            },
            deleteSubstr: function (subStr, startPos, substrLength, str) {
                console.log("delete substr");
                if (subStr.length > 0) {

                    var currentVal = this.formattedVal;
                    var rezStr = "";
                    var strArr;
                    var noNumFlag = false;
                    var i;

                    currentVal = currentVal.split("");
                    currentVal.splice(startPos, substrLength);

                    if (str) {
                        strArr = subStr.split("");
                        // check is it number
                        for (i = 0; i < strArr.length; i += 1) {
                            if (!Number.isNaN(parseInt(strArr[i]))) {
                                noNumFlag = true;
                                break;
                            }
                        }
                        if (noNumFlag) {
                            currentVal.splice(startPos, 0, str);
                        } else {
                            return;
                        }
                    }

                    // clear NaN
                    for (i = 0; i < currentVal.length; i += 1) {
                        if (!Number.isNaN(parseInt(currentVal[i]))) {
                            rezStr += currentVal[i];
                        }
                    }
                    this.val = rezStr;
                    this.formattedVal = this.strFormatted(this.val, this.processingMask);
                    this.charCode = 0;
                    this.charSymbol = 0;
                    this.caretMoveFlag = false;
                    this.selectedSubstr = "";
                    this.endPos = 0;

                }
            },
            insertSymbol: function () {
                var currentVal = this.formattedVal;
                if (currentVal.length > 1) {
                    var rezStr = "";
                    var valArr = currentVal.split("");
                    var i;
                    valArr.splice(this.startPos, 0, String(this.charSymbol));
                    for (i = 0; i < valArr.length; i += 1) {
                        if (!Number.isNaN(parseInt(valArr[i]))) {
                            rezStr += valArr[i];
                        }
                    }

                    this.val = rezStr;
                    this.formattedVal = this.strFormatted(this.val, this.processingMask);
                    this.charCode = 0;
                    this.charSymbol = 0;
                    this.caretMoveFlag = false;
                    this.selectedSubstr = "";
                    this.endPos = 0;
                }
            },
            setStartOfPattern: function(){
                var rez = "";
                var pattern = this.activeMask;
                var i;

                for( i = 0; i < pattern.length; i++){
                    if(pattern[i] !== "x"){
                        rez += pattern[i];
                    }else{
                        break;
                    }
                }

                return rez;

            },
            setProcessingMask: function(){
                /*
                ***  Метод обрабатывает активную маску, заменяя числовые символы на "х" для удобства дальнейшего форматирования
                ***  Разрешенный символ сохраняется в массив allowSymbolsArray
                */
                var mask = this.activeMask.split("");
                var rez = "";
                var allowSymbolsArray = [];

                for(var i = 0; i < mask.length; i++ ){
                    if( isNaN(mask[i]) || mask[i] === "x" ){
                        rez += mask[i];
                    }else{
                        allowSymbolsArray.push({pos: i, allow: mask[i]});
                        rez += "x";
                    }
                }

                this.allowSymbolsArray = allowSymbolsArray;
                this.processingMask = rez;
            }

        };
    };

    $.fn.lMask = function (method) {
        if (lMaskMethods[method]) {
            return lMaskMethods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === "object" || !method) {
            return lMaskMethods.init.apply( this, arguments );
            //return lMaskMethods.init.apply(this, this);
        } else {
            $.error("Метод с именем " + method + " не существует");
        }

    };

})(jQuery);