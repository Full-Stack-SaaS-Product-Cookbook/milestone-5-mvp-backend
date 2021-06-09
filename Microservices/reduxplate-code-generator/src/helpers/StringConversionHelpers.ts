
export const convertCamelCaseToCapsCamelCase = (str: string): string => {
    return `${str[0].toUpperCase()}${str.slice(1, str.length)}`
}

export const convertCamelCaseToCapsUnderscoreCase = (str: string): string => {
    const capsCamelCaseStr = convertCamelCaseToCapsCamelCase(str)
    return [...capsCamelCaseStr].reduce((acc, cur) => {
        return `${acc}${isLowerCase(cur) ? cur.toUpperCase() : `_${cur}`}`
    })
}

export const isLowerCase = (str: string): boolean => {
    return str === str.toLowerCase() && str != str.toUpperCase();
}

export const convertPropertyNameToActionConstName = (propertyName: string): string => {
    return `SET_${convertCamelCaseToCapsUnderscoreCase(propertyName)}`
}

export const convertPropertyNameToActionInterfaceName = (propertyName: string): string => {
    return `Set${convertCamelCaseToCapsCamelCase(propertyName)}Action`
}

export const convertPropertyNameToActionFunctionName= (propertyName: string): string => {
    return `set${convertCamelCaseToCapsCamelCase(propertyName)}`
}