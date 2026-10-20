import { AccessToken } from 'livekit-server-sdk';

export default async function handler(event) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};
    const roomName = body.roomName || 'darecam-room';
    const identity = body.identity || 'host';

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing LiveKit credentials' }),
      };
    }

    const token = new AccessToken(apiKey, apiSecret, {
      identity,
      ttl: 60 * 60,
    });

    token.addGrant({
      room: roomName,
      roomCreate: true,
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: await token.toJwt(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create token' }),
    };
  }
}
