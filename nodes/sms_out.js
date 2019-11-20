module.exports = function(RED) {

	var fs = require('fs');
	var { promisify } = require('util');
	var writeFileAsync = promisify(fs.writeFile);
	var unlinkFileAsync = promisify(fs.unlink);
	var FormData = require('form-data');
	var request = require('request-promise-native');
	var convert = require('xml-js');
	var Readable = require('stream').Readable;

    function NetcoreSMSOut(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        const configNode = RED.nodes.getNode(config.configuration);

		this.on('input', function(msg, send, done) {

			const csv = msg.payload.filter(o => o && o.mobile && o.template).map(x => {
				return `"${x.mobile}","${x.template}";
			}).join('\n') + "\n";

			var t = new Date().getTime();
			var tmpfile = `/tmp/${t}_netcore_sms.csv`;

			this.status({
				fill:"green",
				text:"sending."
			});

			writeFileAsync(tmpfile, csv)
				.then(() => {
					
					const reqData = {
						username: configNode.username,
		        		password: configNode.password,
		        		feedid: configNode.feed_id,
		        		sender_id: configNode.sender_id,
		        		override_dnd: String(configNode.override_dnd),
		        		upload: fs.createReadStream(tmpfile)
					};

					this.status({
						fill:"green",
						text:"sending.."
					});

					msg.netcore = {
						reqData: reqData,
						csv: csv
					};

					return request({
						url: "http://bulkpush.mytoday.com/BulkSms/UploadFormFile",
						method: "POST",
						formData: reqData
					});
				})
				.then(data => {
					return unlinkFileAsync(tmpfile).then(x => data);
				})
				.then(res => {
					var result = convert.xml2js(res, {compact: true});
					msg.payload = result || {};
					msg.payload._raw = res;
					send(msg);
					this.status({});
					done()
				})
				.catch(err => {
					this.status({
						fill:"red",
						text:"failed"
					});
					console.error(err)
					done(err);
				});
		});

    }

    RED.nodes.registerType("netcore_sms_out", NetcoreSMSOut);
};
