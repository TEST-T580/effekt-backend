const crypto = require(global.appRoot + '/custom_modules/authorization/crypto.js')

var con

//region Get

/**
 * Returns a Donor object if a valid change password token is found in Database
 * @param {string} token A 40 hcaracter long random token
 * @returns {?object} A Donor object
 */
function getDonorByChangePassToken(token) {
    return new Promise(async (fulfill, reject) => {
        try {
            var [result] = await con.query(`
            SELECT 
                D.ID, 
                D.full_name 
            
            FROM ChangePass as C 
                INNER JOIN Donors as D
                    ON C.userID = D.ID
            
            WHERE C.token = ? AND expires > NOW()
            
            LIMIT 1`, [token])
        } catch (ex) {
            reject(ex)
            return false
        }

        if (result.length > 0) fulfill({
            id: result[0].ID,
            fullName: result[0].full_name
        })
        else fulfill(null)
    })
}

/**
 * Checks whether access token grants a given permission
 * @param {String} token Access token
 * @param {String} permission A specific permission
 * @returns {boolean}
 */
function getCheckPermissionByToken(token, permission) {
    return new Promise(async (fulfill, reject) => {
        try {
            throw "Needs updating for tokens instead of keys"
            var [result] = await con.query(`
                SELECT 1 
                    FROM Access_token as T
                    
                    INNER JOIN Access_keys_permissions as Combine
                        ON K.ID = Combine.Key_ID
                    
                    INNER JOIN Access_permissions as P
                        ON P.ID = Combine.Permission_ID
                        
                    WHERE 
                        T.token = ?
                        AND
                        P.shortName = ?`, 
                    [token, permission])
        } catch (ex) {
            reject(ex)
            return false
        }

        if (result.length > 0) fulfill(true)
        else fulfill(false)
    })
}

//endregion

//region Add
//endregion

//region Modify
/**
 * Updates a Donors password in the database
 * Does all the cryptographic work, salting and hashing
 * @param {number} userId Donors ID
 * @param {string} password Donors chosen password in plaintext
 * @returns {boolean} To indicate success or failiure
 */
function updateDonorPassword(donorID ,password) {
    return new Promise(async (fulfill, reject) => {
        let salt = crypto.getPasswordSalt();
        let hashedPassword = crypto.hashPassword(password, salt);

        try {
            var [result] = await con.query(`UPDATE Donors SET password_hash = ?, password_salt = ? WHERE ID = ?`, [hashedPassword, salt, donorID])
        } catch (ex) {
            reject(ex)
            return false
        }

        if (result.length > 0) fulfill(true)
        else fulfill(false)
    })
}
//endregion

//region Delete
//endregion

module.exports = function(dbPool) {
    con = dbPool

    return {
        getDonorByChangePassToken,
        getCheckPermissionByToken,
        updateDonorPassword
    }
} 