import { NextResponse } from 'next/server';

const username = process.env.TEBEX_PROJECT_ID;
const password = process.env.TEBEX_PRIVATE_KEY;

export async function POST(request: Request) {
  try {
    const { user_id, discordId, packageIds } = await request.json();

    const basketResponse = await fetch(
      `${process.env.HEADLESS_API_ENDPOINT}/api/baskets`,
      {
        method: 'POST',
        headers: {
          "Authorization": "Basic " + Buffer.from(username + ":" + password).toString("base64"),
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          complete_auto_redirect: true,
          complete_url: "https://gamecrux.io/games",
          cancel_url: "https://tebex-js.pages.dev/cancel",
          custom: {
           userid: user_id,
          },
        }),
      }
    );

    const responseText = await basketResponse.text();
    console.log('Basket creation response:', {
      status: basketResponse.status,
      response: responseText
    });

    if (!basketResponse.ok) {
      return NextResponse.json({
        error: 'Failed to create basket',
        details: responseText
      }, { status: basketResponse.status });
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error('Failed to parse basket creation response:', e);
      return NextResponse.json({
        error: 'Failed to parse basket creation response',
        details: responseText
      }, { status: 500 });
    }

    const basketIdent = data.ident;

    console.log('Adding packages to basket:', packageIds,basketIdent);

    // Add packages to basket
    for (const packageId of packageIds) {
      const packageResponse = await fetch(
        `https://headless.tebex.io/api/baskets/${basketIdent}/packages`,
        {
          method: 'POST',
          headers: {
        "Authorization": "Basic " + Buffer.from(username + ":" + password).toString("base64"),
        "Content-Type": "application/json"
          },
          body: JSON.stringify({
          package_id: packageId,
          variable_data: {
            discord_id: discordId,
          },
          }),
        }
      );

      const packageResponseText = await packageResponse.text();
      console.log('Package addition response:', {
        packageId,
        status: packageResponse.status,
        response: packageResponseText
      });

      if (!packageResponse.ok) {
        return NextResponse.json({
          error: 'Failed to add package to basket',
          details: packageResponseText
        }, { status: packageResponse.status });
      }
    }

    return NextResponse.json({ ident: basketIdent });
  } catch (error) {
    console.error('Error in create-basket:', error);
    return NextResponse.json({
      error: 'Failed to create basket',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}