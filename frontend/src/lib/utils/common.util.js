export const validateEmail = (email) => {
    return !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(
        email
    )
}

export const findInArray = (array, predicate) => {
    for (let i = 0; i < array.length; i++) {
        if (predicate(array[i])) {
            return i
        }
    }
    return -1
}