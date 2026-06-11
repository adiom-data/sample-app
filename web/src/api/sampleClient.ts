import { createClient } from "@connectrpc/connect";
import { createConnectTransport } from "@connectrpc/connect-web";
import { createAuthInterceptor, type AuthTokenManager } from "@adiom-data/framework-web/auth";
import { SampleService } from "../gen/sample/v1/sample_pb";

export function createSampleClient(tokenManager: AuthTokenManager) {
  return createClient(
    SampleService,
    createConnectTransport({
      baseUrl: "",
      interceptors: [createAuthInterceptor(tokenManager)],
    }),
  );
}
