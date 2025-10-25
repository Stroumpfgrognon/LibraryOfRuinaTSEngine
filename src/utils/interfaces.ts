/** Code taken from Tamás Polgár from https://medium.com/developer-rants/follow-up-how-to-tell-if-an-object-conforms-to-a-typescript-interface-f99b4b77d602
 * 
 * Checks wether or not a type comforms to a given interface
 */

const isTSInterface = <T>(value: any, keys: (keyof T)[], requiredKeys: (keyof T)[]): value is T => {
    if (typeof value !== 'object' || value === null)
        return false;
 
    return(
        requiredKeys.every(key => key in value) &&                              //  Ensure all required keys are present
        (Object.keys(value) as (keyof T)[]).every(key => keys.includes(key))    //  Ensure no undefined keys are present
    );
}