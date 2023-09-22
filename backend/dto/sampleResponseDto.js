/**
 * Returns `response` DTO
 * @param {0|-1} status 
 * @param {"SUCCESS"|"FAILURE"} result 
 * @param {*} data 
 */
function responseDto(status, result, data){
    return {
        status: status,
        result: result,
        data: data
    }
};


module.exports = responseDto;