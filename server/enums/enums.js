
module.exports = {

    relationships: Object.freeze({
        friend: 'friend',
        guardian: 'guardian',
        child: 'child'
    }),
    statuses: Object.freeze({
        active: 'active',
        pending: 'pending',
        pendingack: 'pendingack',
        inactive: 'inactive'
    }),
    httpStatusCodes: Object.freeze({
        ok: 200,
        created: 201,
        badRequest: 400,
        unauthorized: 401,
        forbidden: 403,
        notFound: 404,
        internalError: 500
    }),
    routeMethods: Object.freeze({
       GET: 'GET',
       PUT: 'PUT',
       POST: 'POST',
       DEL: 'DEL'
    })
};
