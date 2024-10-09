

export const splitShift = (shiftCode: string)=>{
  return shiftCode.trim().toLowerCase().split(/[^a-z0-9]+/).map(t => t.trim());
}
