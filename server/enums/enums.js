
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
    }),
    auth: Object.freeze({
       Admin: {  role: ['admin', 'super-admin'], isAdult: true },
       SuperAdmin: {  role: ['super-admin'], isAdult: true  },
       CurrentAdult: {  currentUser: true, isAdult: true },
       CurrentAny: {  currentUser: true },
       Guest: {},
       StrictGuardian: { isGuardian: 'strict', isAdult: true },
       NonStrictGuardian: { isGuardian: 'non-strict', isAdult: true },
       HasRelationship: { isRelated: true },
       Subscribed: { isSubscribed: true },
       AllowInactive: { allowInactive: true }
    })
};

