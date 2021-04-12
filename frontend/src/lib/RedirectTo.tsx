import {History} from "history";
import {LocationState} from "history";

//Since hooks can only be instantiated inside function component,
//history hook must be injected upon instantiation of RedirectTo function.
export default (history:  History<LocationState>) => {
    return (page: string) => {
        return () => {
            history.push(page);
        }
    };
}