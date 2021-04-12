const QueryParam = (param: string): string => {
    let search = window.location.search;
    let params = new URLSearchParams(search);
    let val = params.get(param);
    if (val) {
        return val;
    }
    return "";
}

export interface CursorPosition {
    start: number;
    end: number;
}

const defaultPos = {start: 0, end: 0};

function GetInputSelection(el: any): CursorPosition {
    if (!el) {
        return defaultPos;
    }

    let start: number = 0, end: number = 0
    let normalizedValue, range, textInputRange, len, endRange;

    if (typeof el.selectionStart == "number" && typeof el.selectionEnd == "number") {
        start = el.selectionStart;
        end = el.selectionEnd;
    } else {
        if (!el.selection) {
            return defaultPos;
        }

        range = el.selection.createRange();
        if (range && range.parentElement() === el) {
            len = el.value.length;
            normalizedValue = el.value.replace(/\r\n/g, "\n");

            // Create a working TextRange that lives only in the input
            textInputRange = el.createTextRange();
            textInputRange.moveToBookmark(range.getBookmark());

            // Check if the start and end of the selection are at the very end
            // of the input, since moveStart/moveEnd doesn't return what we want
            // in those cases
            endRange = el.createTextRange();
            endRange.collapse(false);

            if (textInputRange.compareEndPoints("StartToEnd", endRange) > -1) {
                start = end = len;
            } else {
                start = -textInputRange.moveStart("character", -len);
                start += normalizedValue.slice(0, start).split("\n").length - 1;

                if (textInputRange.compareEndPoints("EndToEnd", endRange) > -1) {
                    end = len;
                } else {
                    end = -textInputRange.moveEnd("character", -len);
                    end += normalizedValue.slice(0, end).split("\n").length - 1;
                }
            }
        }
    }

    return {
        start: start,
        end: end
    };
}

export {
    QueryParam,
    GetInputSelection
}