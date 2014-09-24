"use strict";
var cb = require('common-bundle')();

var authMdl = cb.rootRequire('mdl-auth');
var uploadsCtrl = cb.rootRequire('ctrl-uploads');
var passport = require('passport');
var enums = cb.enums;
var a = enums.auth;
var rs = cb.rootRequire('route-builder')();

module.exports = function () {

    rs.getResource('user')
        .addResource({ uri: 'fileHelper'})
        .addMethod(rs.resourceMethods.GET,
            authMdl.authorize([a.CurrentAny, a.StrictGuardian]), uploadsCtrl.getUploadsScreen, { links: false });

    rs.getResource('user')
        .addResource({ uri: 'fileGroups' } )
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]), uploadsCtrl.getFileGroups, { self: true })
            .addMethod(rs.resourceMethods.POST,
                authMdl.authorize([a.CurrentAny, a.StrictGuardian]), uploadsCtrl.upload)
            .addMethod(rs.resourceMethods.PUT,
                authMdl.authorize([a.Admin, a.CurrentAny, a.StrictGuardian]), uploadsCtrl.removeFileGroup)
        .addResource({ uri: 'fileSubs' })
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]), uploadsCtrl.getShares);

    rs.getResource('fileGroups')
        .addResource({ uri: ':groupId', name: "fileGroup", rel: "fileGroup" }, { collectionChild: true, key: 'groupId' })
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]), uploadsCtrl.getFileGroups, { self: true })
        .addResource({ uri: 'files'})
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.CurrentAny, a.NonStrictGuardian, a.Subscribed]), uploadsCtrl.downloadFiles)
            .addMethod(rs.resourceMethods.POST,
                authMdl.authorize([a.CurrentAny, a.StrictGuardian]), uploadsCtrl.upload)
            .addMethod(rs.resourceMethods.DEL,
                authMdl.authorize([a.Admin, a.CurrentAny, a.StrictGuardian]), uploadsCtrl.removeFile)
        .addResource({ uri: ':fileName'})
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.CurrentAny, a.NonStrictGuardian, a.Subscribed]), uploadsCtrl.downloadFiles);

    rs.getResource('fileGroup')
        .addResource({ uri: 'fileHelper'})
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.CurrentAny, a.StrictGuardian]), uploadsCtrl.getUploadsScreen, { links: false });


    rs.getResource('fileGroup')
        .addResource({ uri: 'fileSubs'})
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian]), uploadsCtrl.getSharesFileGroup, { self: true })
        .addResource({ uri: ':relUser', name: 'subscribedUser', rel: 'subscribedUser'})
            .addMethod(rs.resourceMethods.GET,
                authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian, a.Subscribed]), uploadsCtrl.getSharedFileGroupForUser)
            .addMethod(rs.resourceMethods.POST,
                authMdl.authorize([a.CurrentAdult, a.StrictGuardian]), uploadsCtrl.shareFileGroup)
            .addMethod(rs.resourceMethods.DEL,
                authMdl.authorize([a.Admin, a.CurrentAny, a.NonStrictGuardian, a.Subscribed]), uploadsCtrl.unshareFileGroup);



};
