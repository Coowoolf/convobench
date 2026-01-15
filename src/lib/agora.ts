/**
 * Agora Conversational AI SDK Wrapper
 * Based on Conversational-AI-Demo integration patterns
 */

// ==================== Types ====================
export interface AgoraConfig {
    appId: string;
    appCert?: string;
    basicAuthKey?: string;
    basicAuthSecret?: string;
}

export interface StartAgentParams {
    channelName: string;
    uid: string;
    llmUrl: string;
    llmKey: string;
    systemPrompt: string;
    ttsVendor?: string;
    ttsParams?: Record<string, unknown>;
}

export interface StartAgentResponse {
    agent_id: string;
    create_ts: number;
    status: string;
}

export interface StopAgentResponse {
    success: boolean;
}

// ==================== Constants ====================
const AGORA_API_BASE = 'https://api.agora.io/api/convoai/v1';

// ==================== Helper Functions ====================
function getBasicAuthHeader(key: string, secret: string): string {
    const credentials = Buffer.from(`${key}:${secret}`).toString('base64');
    return `Basic ${credentials}`;
}

// ==================== Main Functions ====================

/**
 * Get Agora configuration from environment variables
 */
export function getAgoraConfig(): AgoraConfig {
    return {
        appId: process.env.AGORA_APP_ID || '',
        appCert: process.env.AGORA_APP_CERT,
        basicAuthKey: process.env.AGORA_BASIC_AUTH_KEY,
        basicAuthSecret: process.env.AGORA_BASIC_AUTH_SECRET,
    };
}

/**
 * Start an Agora Conversational AI Agent
 */
export async function startAgent(
    config: AgoraConfig,
    params: StartAgentParams
): Promise<StartAgentResponse> {
    const { appId, appCert, basicAuthKey, basicAuthSecret } = config;

    if (!appId) {
        throw new Error('AGORA_APP_ID is required');
    }

    if (!basicAuthKey || !basicAuthSecret) {
        throw new Error('AGORA_BASIC_AUTH_KEY and AGORA_BASIC_AUTH_SECRET are required');
    }

    const url = `${AGORA_API_BASE}/projects/${appId}/agents`;

    const body = {
        channel_name: params.channelName,
        uid: params.uid,
        ...(appCert && { app_cert: appCert }),
        properties: {
            llm: {
                url: params.llmUrl,
                api_key: params.llmKey,
                system_messages: [{ role: 'system', content: params.systemPrompt }],
            },
            tts: params.ttsVendor ? {
                vendor: params.ttsVendor,
                params: params.ttsParams || {},
            } : undefined,
            parameters: {
                audio_scenario: 'default',
                transcript: {
                    enable: true,
                    enable_words: true,
                    protocol_version: 'v2',
                },
                enable_metrics: true,
            },
        },
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': getBasicAuthHeader(basicAuthKey, basicAuthSecret),
        },
        body: JSON.stringify(body),
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to start agent: ${response.status} ${error}`);
    }

    return response.json();
}

/**
 * Stop an Agora Conversational AI Agent
 */
export async function stopAgent(
    config: AgoraConfig,
    agentId: string
): Promise<StopAgentResponse> {
    const { appId, basicAuthKey, basicAuthSecret } = config;

    if (!appId || !basicAuthKey || !basicAuthSecret) {
        throw new Error('Agora configuration is incomplete');
    }

    const url = `${AGORA_API_BASE}/projects/${appId}/agents/${agentId}`;

    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Authorization': getBasicAuthHeader(basicAuthKey, basicAuthSecret),
        },
    });

    if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to stop agent: ${response.status} ${error}`);
    }

    return { success: true };
}

/**
 * Generate RTC Token (simplified version)
 * In production, use Agora Token Server
 */
export function generateChannelName(): string {
    return `eval-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
