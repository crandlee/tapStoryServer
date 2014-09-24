"use strict";
var cb = require('common-bundle')();

var uploadsCtrl = cb.rootRequire('ctrl-uploads');
var passport = require('passport');
var enums = cb.enums;
var a = enums.auth;
var rs = cb.rootRequire('route-builder')();

module.exports = function () {

    rs.getResource('user')
        .addResource({ uri: 'fileHelper'})
        .addMethod(rs.resourceMethods.GET,
            { rules: [a.CurrentAny, a.StrictGuardian]}, uploadsCtrl.getUploadsScreen, { links: false,
                description: 'Display the file upload helper for <%=userName%>'});

    rs.getResource('user')
        .addResource({ uri: 'fileGroups' } )
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAny, a.NonStrictGuardian]}, uploadsCtrl.getFileGroups, { self: true,
                    description: 'Display all file groups for <%=userName%>'})
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.CurrentAny, a.StrictGuardian]}, uploadsCtrl.upload,
                    { bodyParams: [ 'groupName' ], description: 'Upload a new file group for <%=userName%>' })
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.Admin, a.CurrentAny, a.StrictGuardian]}, uploadsCtrl.removeFileGroup,
                    { bodyParams: [ 'groupId' ], description: 'Delete an existing file group for <%=userName%>'});

    rs.getResource('user')
        .addResource({ uri: 'fileSubs' })
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAny, a.NonStrictGuardian]}, uploadsCtrl.getShares, { self: true,
                    description: 'Retrieve the current file group subscriptions for <%=userName%>'});

    rs.getResource('fileGroups')
        .addResource({ uri: ':groupId', name: "fileGroup", rel: "fileGroup" }, { collectionChild: true, key: 'groupId' })
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAny, a.NonStrictGuardian]}, uploadsCtrl.getFileGroups, { self: true,
                    description: 'Retrieve the file group <%=groupName%> for user <%=userName%>'})
        .addResource({ uri: 'files'})
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.CurrentAny, a.NonStrictGuardian, a.Subscribed]}, uploadsCtrl.downloadFiles,
                    { description: 'Download an archived package of files for the file group <%=groupName%>'})
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.CurrentAny, a.StrictGuardian]}, uploadsCtrl.upload,
                    { description: 'Upload a single file to the file group <%=groupName%>'})
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.Admin, a.CurrentAny, a.StrictGuardian]}, uploadsCtrl.removeFile,
                    { bodyParams: [ 'fileName' ], description: 'Upload a single file to the file group <%=groupName%>'})
        .addResource({ uri: ':fileName'})
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.CurrentAny, a.NonStrictGuardian, a.Subscribed]}, uploadsCtrl.downloadFiles,
                    {description: 'Download the file <%=fileName%> from the file group <%=groupName%>'});

    rs.getResource('fileGroup')
        .addResource({ uri: 'fileHelper'})
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.CurrentAny, a.StrictGuardian]}, uploadsCtrl.getUploadsScreen, { links: false,
                    description: 'Display the file helper for the file group <%=groupName%>'});


    rs.getResource('fileGroup')
        .addResource({ uri: 'fileSubs'})
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAny, a.NonStrictGuardian]}, uploadsCtrl.getSharesFileGroup, { self: true })
        .addResource({ uri: ':relUser', name: 'subscribedUser', rel: 'subscribedUser'})
            .addMethod(rs.resourceMethods.GET,
                { rules: [a.Admin, a.CurrentAny, a.NonStrictGuardian, a.Subscribed]}, uploadsCtrl.getSharedFileGroupForUser)
            .addMethod(rs.resourceMethods.POST,
                { rules: [a.CurrentAdult, a.StrictGuardian]}, uploadsCtrl.shareFileGroup)
            .addMethod(rs.resourceMethods.DEL,
                { rules: [a.Admin, a.CurrentAny, a.NonStrictGuardian, a.Subscribed]}, uploadsCtrl.unshareFileGroup);



};
