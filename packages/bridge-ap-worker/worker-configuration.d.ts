// Generated by Wrangler by running `wrangler types`

interface Env {
	KV_WORKER_BRIDGE_AP: KVNamespace;
	IS_DEV: string;
	IMAGES_AUTH_KEY: string;
	PREVIEWS_AUTH_KEY: string;
	BAQ_POD_MAPPING_OBJECT: DurableObjectNamespace<import("./src/index").BaqPodMappingObject>;
	BAQ_POD_OBJECT: DurableObjectNamespace<import("./src/index").BaqPodObject>;
	R2_WORKER_BRIDGE_AP_BAQ: R2Bucket;
}
