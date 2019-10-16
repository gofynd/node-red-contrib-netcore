module.exports = function(RED) {

    function NetcoreSMSConfigNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;

        this.name = config.name;
        this.username = config.username;
        this.password = config.password;
        this.feed_id = config.feed_id;
        this.sender_id = config.sender_id;
        this.override_dnd = config.override_dnd;
    }
 
    RED.nodes.registerType("netcore_sms_config", NetcoreSMSConfigNode);
};