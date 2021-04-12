
//@todo currently have not decided what to store in reducer.
//When deciding to store in reducer, ask yourself first if localstorage can be used instead.
const states = {
    dummy: "",
};
const reducer = (state = states, action: { type: string; }) => {
    return state;
};

export default reducer;