import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { WEDDING } from "@/lib/invitation";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const guestName = searchParams.get("name")?.trim() || "";
  const invitees = searchParams.get("invitees")?.trim() || "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #570c21 0%, #3d0615 100%)",
          padding: "34px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            border: "2px solid #d3b270",
            borderRadius: "24px",
            background: "linear-gradient(180deg, #fdfaf4 0%, #f3ece1 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "42px 56px",
          }}
        >
          {/* Top Label */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "18px",
                letterSpacing: "6px",
                textTransform: "uppercase",
                color: "#9a7942",
                fontWeight: 600,
              }}
            >
              SAVE THE DATE · WEDDING INVITATION
            </div>
            <div
              style={{
                width: "140px",
                height: "2px",
                backgroundColor: "#b68d40",
                marginTop: "12px",
              }}
            />
          </div>

          {/* Couple Names + Personalized Pill */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: "78px",
                fontStyle: "italic",
                color: "#5e0e24",
                lineHeight: 1.05,
              }}
            >
              {`${WEDDING.bride.name} & ${WEDDING.groom.name}`}
            </div>

            {guestName ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "22px",
                  padding: "10px 28px",
                  borderRadius: "999px",
                  backgroundColor: "#5e0e24",
                  color: "#faf7f2",
                  fontSize: "26px",
                }}
              >
                <span style={{ color: "#e2c27f", fontSize: "20px", marginRight: "10px" }}>
                  Cordially Inviting:
                </span>
                <span style={{ fontWeight: 700 }}>{guestName}</span>
                {invitees ? (
                  <span
                    style={{
                      display: "flex",
                      fontSize: "18px",
                      backgroundColor: "#d3b270",
                      color: "#3d0615",
                      padding: "3px 12px",
                      borderRadius: "999px",
                      fontWeight: 700,
                      marginLeft: "12px",
                    }}
                  >
                    {`Invitees (${invitees})`}
                  </span>
                ) : null}
              </div>
            ) : (
              <div
                style={{
                  fontSize: "24px",
                  color: "#6c4c55",
                  marginTop: "16px",
                }}
              >
                {WEDDING.bride.parents}
              </div>
            )}
          </div>

          {/* Bottom Event Info */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div
              style={{
                fontSize: "24px",
                color: "#5e0e24",
                fontWeight: 700,
                letterSpacing: "2px",
              }}
            >
              TUESDAY, 12TH JAN 2027 · 8:00 P.M.
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "20px",
                color: "#9a7942",
                marginTop: "6px",
              }}
            >
              {`${WEDDING.event.hijriDate} · ${WEDDING.venue.name}, Indore`}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
