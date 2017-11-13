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

                //
                param.charCode = e.charCode;
                param.charSymbol = String.fromCharCode(e.charCode);


            });

            // interception delete and backspace button
            $self.on("keydown", function (e) {
                console.log("keydown");

                param.cursorPos = param.getCaretPos(e.target);
                // delete
                if (e.keyCode === 46) {
                    console.log("delete");

                } else if (e.keyCode === 8) {
                    console.log("backspace");

                }
            });

            $self.on("input", function (e) {
                console.log("input");
                var charCode = param.charCode;
                var charSymbol = param.charSymbol;
                var index;

                // get current val
                param.currentVal = $self.val();
                console.log("currentVal = ", param.currentVal);
                console.log("char symbol = ", charSymbol);
                console.log("char code = ", charCode);

                if (charCode !== 0) {
                    // this is first symbol and this symbol is allow
                    if(param.currentVal.length === 1 && param.checkSymbol(charCode, true)){
                        console.log("first symbol");
                        // Выбираем маску, если она не выбрана
                        if( !param.activeMask.length ) {
                            param.activeMask = param.defaultMask;
                        }
                        param.formattedVal = true;

                        if( param.currentVal === "8" ){
                            param.val = "+7("
                        }else if(param.currentVal === "9" && param.startOfPattern === "+7("){
                            param.val = "+7(9";
                        }else{
                            param.val = param.currentVal;
                        }
                    }


                    // output
                    param.formattedVal = param.strFormatted(param.val, param.processingMask);
                    $self.val(param.formattedVal);

                } else if (param.formattedVal.length !== 0) {
                    if (param.formattedVal === false) {
                        param.formattedVal = "";
                    }
                    param.currentVal = param.formattedVal;
                }



                // move cursor for "-()" symbols
                /*if (param.caretMoveFlag) {
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

                 }*/

                console.log(param);

            });

        }
    };
    var initParam = function () {
        return {
            defaultMask: "+7 (___) ___-__-__",
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
            cursorPos: 0,
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

                if (str.length > 0 && pattern.length > 0) {

                    var result = "";
                    var i;
                    var allowSymbolsArray = this.allowSymbolsArray;

                    for (i = 0; i < pattern.length; i += 1) {
                        if( pattern[i] === "_" ){
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
                                //break;
                                result += pattern[i];
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
                /*if (obj.selectionStart) {
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
                 alert(rc.text.length);
                 return rc.text.length;
                 }
                 return 0;*/
                var CaretPos = 0;
                if ( document.selection ) {
                    obj.focus ();
                    var Sel = document.selection.createRange();
                    Sel.moveStart ('character', -obj.value.length);
                    CaretPos = Sel.text.length;
                } else if ( obj.selectionStart || obj.selectionStart == '0' ) {
                    CaretPos = obj.selectionStart;
                }
                //alert(CaretPos);
                return CaretPos;

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
                    if(pattern[i] !== "_"){
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
                    if( isNaN(mask[i]) || mask[i] === "_" ){
                        rez += mask[i];
                    }else{
                        allowSymbolsArray.push({pos: i, allow: mask[i]});
                        rez += "_";
                    }
                }

                this.allowSymbolsArray = allowSymbolsArray;
                this.processingMask = rez;
            },


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