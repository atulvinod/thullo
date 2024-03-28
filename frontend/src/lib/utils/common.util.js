export const validateEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i.test(
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