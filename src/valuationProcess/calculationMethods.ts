export function FCFEMethod(inputs:object) {
  console.log('Input Values',inputs);
  //Perform calculations here.

  const result={
    "valuation":87898797,
    "presentValue": 7878787,
    "equityValue": 667676,
    "valuePerShare":4534.34
  }
  return {"message":"Calculated valuation using FCFE",result:result};
}

export function OtherMethod() {
  return "This is Other Method which we will add in Future.";
}
