"use strict";
(function ($) {
    var lMaskMethods = {
        init: function (obj) {

            var $self = $(this);
            var param = new initParam();
            $self.val("");

            /*** set mask ***/
            if( obj["mask"] && obj["mask"].length >= 6 ){

                /*** mask passed at initialization ***/
                param.activeMask = obj["mask"];
            }else{

                /*** default mask ***/
                param.activeMask = param.defaultMask;
            }
            /*** set limitSymbol ***/
            param.limitSymbol = param.activeMask.length;

            /*** set start pattern - string before the first occurrence x symbol ***/
            param.startOfPattern = param.setStartOfPattern();

            /*** replace number symbols to x ***/
            param.setProcessingMask();

            /*$self.on("paste", function(e){
             console.log(e);
             });*/

            /*** keydown handler ***/
            $self.on("keydown", function (e) {
                param.backspace = false;

                /*if (e.keyCode === 46) {
                    // delete

                } else*/
                if (e.keyCode === 8 || e.keyCode === 229|| e.keyCode === 0) {
                    /*** backspace key ***/
                    param.backspace = true;

                }

            });
            /*** input handler ***/
            $self.on("input", function (e) {

                /*** before state ***/
                var val = param.val;
                var symbolInMask;
                var firstFlag = false;

                /*** get caret position ***/
                param.caretPos = param.getCaretPos(e.target);

                /*** get new state***/
                param.currentVal = $self.val();
                //symbolInMask = param.activeMask[param.currentVal.length - 1];

                /*** get last symbol ***/
                param.charSymbol = param.currentVal[param.currentVal.length - 1];

                /*** input the first symbol ***/
                if(param.currentVal.length === 1){
                    firstFlag = true;
                }
                // Проверяем, какой символ стоит на текущей позиции в маске
                if( !param.backspace) {

                    //if (symbolInMask === "x" || symbolInMask === param.charSymbol || parseInt(param.charSymbol) === 7 || parseInt(param.charSymbol) === 8 || parseInt(param.charSymbol) === 9) {
                    if (!isNaN(param.charSymbol) || parseInt(param.charSymbol) === 7 || parseInt(param.charSymbol) === 8 || parseInt(param.charSymbol) === 9) {
                        console.log("in if");
                        if (param.checkSymbol(param.charSymbol, firstFlag)) {
                            // Был введён новый символ и этот символ разрешен

                            if (param.currentVal === "8") {
                                param.currentVal = "+7("
                            } else if (param.currentVal === "9" && param.startOfPattern === "+7(") {
                                param.currentVal = "+7(9";
                            } else if (param.currentVal === "+" && param.startOfPattern === "+7(") {
                                param.currentVal = "+7(";
                            } else if (param.currentVal === "7" && param.startOfPattern === "+7(") {
                                param.currentVal = "+7(";
                            }

                            // Если в маске следом за текущем символом идет не число, до добавляем его к значению
                            if (isNaN(param.activeMask[param.currentVal.length]) && param.activeMask[param.currentVal.length] !== "x" && param.activeMask[param.currentVal.length] !== undefined) {
                                param.currentVal += param.activeMask[param.currentVal.length];
                            }
                            // Записываем новое состояние, если допустима длинна строки
                            if (param.currentVal.length <= param.activeMask.length) {
                                param.val = param.currentVal;
                            }

                        }
                    }


                } else {
                    /*** Нажата клавиша backspace ***/
                    $("#output").html("backspace2");
                    if (param.backspace) {
                        $("#output").html("backspace3");

                        //alert("backspace");
                        if (param.currentVal.length <= param.activeMask.length) {

                            /* если последний символ не числовой, то передвигаем курсор */
                            //if(!isNaN(param.currentVal[param.currentVal.length - 1]) && param.formattedVal[param.formattedVal.length - 1] == "-"){
                                //e.target.setSelectionRange(param.caretPos - 1, param.caretPos - 1);
                            //}
                            param.val = param.currentVal;
                        }
                    }
                }

                // ----------------------------------
                // output
                param.formattedVal = param.strFormatted(param.val);
                if(param.backspace && isNaN(param.formattedVal[param.formattedVal.length - 1 ]) && !isNaN(param.currentVal[param.currentVal.length - 1]) ){
                    param.formattedVal = param.formattedVal.slice(0,-1);
                }
                $self.val(param.formattedVal);
                // ----------------------------------

            });

        }
    };
    var initParam = function () {
        return {
            backspace: false,
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
                    var arr1 = [0,1,2,3,4,5,6,7,8,9,0];
                    var arr2 = ["+","(",")","-"];
                    //var backSpace = false;
                    var i;
                    for (i = 0; i < arr1.length; i += 1) {
                        if (symbol == arr1[i]) {
                            flag = true;
                            return flag;
                        }
                    }

                    var j;
                    if (first) {
                        for (j = 0; j < arr2.length; j += 1) {
                            if (symbol == arr2[j]) {
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

                var pattern = this.processingMask;
                var newStr = ""; // Строка из чисел, откуда вырезаны все числовые символы, кроме +
                var allowSymbolsArray = this.allowSymbolsArray;
                var result = "";
                str = str.split("");

                for(var i = 0; i < str.length; i++){
                    if(str[i] === "+" || !isNaN(str[i])){
                        newStr += str[i];
                    }
                }

                var cnt = 0;
                for(var i = 0; i < pattern.length; i++){
                    if(pattern[i]==="x"){
                        /*** Если строка достигла конца ***/
                        if (newStr[cnt] === undefined) {
                            break;
                        }

                        /*** Проверяем, есть ли ограничение на конкретный символ ***/
                        if( allowSymbolsArray.length ){
                            for( var j = 0; j < allowSymbolsArray.length; j++){
                                if(allowSymbolsArray[j].pos === i && newStr[cnt] !== allowSymbolsArray[j].allow){
                                    return result;
                                }
                            }
                            result += newStr[cnt];
                            cnt += 1;
                        }

                    }else{
                        result += pattern[i];
                    }
                }

                console.log("result = ", result);
                return result;
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
                    if( !isNaN(parseInt(arrVal[pos - 1])) ) {
                        arrVal.splice(pos - 1, 1);
                    }
                    for (var i = 0; i < arrVal.length; i += 1) {
                      rezVal += arrVal[i];
                    }
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
                    if( ( isNaN(mask[i]) ) || mask[i] === "x" ){
                        if(mask[i] === "+"){
                            rez += "x";
                            allowSymbolsArray.push({pos: i, allow: "+"});
                        }else {
                            rez += mask[i];
                        }
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