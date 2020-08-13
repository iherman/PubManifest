enum ex {
    exit,
    proceed
};


const a = (x: number) :ex => {
    if (x > 200) return ex.exit;
    else return ex.proceed;

}


console.log(a(340) === ex.exit);
console.log(a(340) === ex.proceed);
