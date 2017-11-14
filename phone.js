"use strict";
(function ($) {
    var lMaskMethods = {
        preInit: function( obj ){

            var $self = $(this);

            if($self.val().length > 0){
                $self.on("input", function(){

                    if( $self.val().length === 0 ){

                        /*** if default value = 0 => init plugin ***/
                        $self.off("input");
                        setTimeout(function(){
                            lMaskMethods.init($self, obj);
                        }, 100);

                    }

                });

            }
        },
        init: function (self, obj) {

            var $self = self;
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
                /*** if no backspace button was press ***/
                if( !param.backspace) {

                    //if (symbolInMask === "x" || symbolInMask === param.charSymbol || parseInt(param.charSymbol) === 7 || parseInt(param.charSymbol) === 8 || parseInt(param.charSymbol) === 9) {
                    if (!isNaN(param.charSymbol) || parseInt(param.charSymbol) === 7 || parseInt(param.charSymbol) === 8 || parseInt(param.charSymbol) === 9) {

                        if (param.checkSymbol(param.charSymbol, firstFlag)) {

                            /*** special Condition for Russian numbers ***/
                            if (param.currentVal === "8") {
                                param.currentVal = "+7("
                            } else if (param.currentVal === "9" && param.startOfPattern === "+7(") {
                                param.currentVal = "+7(9";
                            } else if (param.currentVal === "+" && param.startOfPattern === "+7(") {
                                param.currentVal = "+7(";
                            } else if (param.currentVal === "7" && param.startOfPattern === "+7(") {
                                param.currentVal = "+7(";
                            }

                            /*** next symbol in mask is not a number ***/
                            if (isNaN(param.activeMask[param.currentVal.length]) && param.activeMask[param.currentVal.length] !== "x" && param.activeMask[param.currentVal.length] !== undefined) {
                                param.currentVal += param.activeMask[param.currentVal.length];
                            }
                            /*** set new state ***/
                            if (param.currentVal.length <= param.activeMask.length) {
                                param.val = param.currentVal;
                            }

                        }
                    }


                } else {
                    /*** press backspace ***/

                    if (param.backspace) {
                        if (param.currentVal.length <= param.activeMask.length) {
                            param.val = param.currentVal;
                        }
                    }
                }

                /*** ==================== ***/
                /***        output        ***/
                param.formattedVal = param.strFormatted(param.val);
                if(param.backspace && isNaN(param.formattedVal[param.formattedVal.length - 1 ]) && !isNaN(param.currentVal[param.currentVal.length - 1]) ){
                    param.formattedVal = param.formattedVal.slice(0,-1);
                }
                $self.val(param.formattedVal);
                /*** ==================== ***/

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
            currentVal: "",
            val: "",
            inputString: "",
            formattedVal: "",
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
                        /*** The line reached the end ***/
                        if (newStr[cnt] === undefined) {
                            break;
                        }

                        /*** check the restriction on a particular symbol ***/
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
            return lMaskMethods.preInit.apply( this, arguments );
            //return lMaskMethods.init.apply(this, this);
        } else {
            $.error("Метод с именем " + method + " не существует");
        }

    };

})(jQuery);