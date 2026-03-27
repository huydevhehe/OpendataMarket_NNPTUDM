import * as nodemailer from "nodemailer";
import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
    email: z.string().email("Email không hợp lệ"),
    name: z.string().optional(),
});

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, name } = schema.parse(body);

        // 📧 Gửi cho quản trị viên
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: process.env.MAIL_TO,
            subject: `[OpenData Market] Người đăng ký mới`,
            html: `
        <h2>Có người vừa đăng ký nhận thông báo!</h2>
        <p><b>Tên:</b> ${name || "Ẩn danh"}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Thời gian:</b> ${new Date().toLocaleString("vi-VN")}</p>
      `,
        });

        // 📧 Gửi cho người dùng (đẹp chuẩn doanh nghiệp)
        await transporter.sendMail({
            from: process.env.MAIL_FROM,
            to: email,
            subject: "Cảm ơn bạn đã đăng ký nhận thông báo – OpenData Market",
            html: `
      <div style="background:#0b0d26;padding:30px;border-radius:12px;color:#fff;font-family:Arial,sans-serif;">
        <div style="text-align:center;margin-bottom:20px;">
          <img src="https://yourdomain.com/logo.png" width="80" alt="Logo"/>
          <h1 style="margin:10px 0;color:#ffffff;">OpenData Market</h1>
        </div>

        <p style="font-size:16px;">Xin chào <b>${name || "bạn"}</b>,</p>
        <p>Cảm ơn bạn đã đăng ký nhận thông báo từ <b>OpenData Market</b> 🎉</p>
        <p>Bạn sẽ sớm nhận được cập nhật mới nhất về dataset, sự kiện và tin tức đặc biệt.</p>

        <div style="margin-top:30px;text-align:center;">
          <a href="https://opendata-market.com" 
             style="display:inline-block;background:linear-gradient(90deg,#7928CA,#FF0080);
                    padding:12px 24px;border-radius:8px;text-decoration:none;color:white;font-weight:bold;">
            Khám phá thêm Dataset
          </a>
        </div>

        <hr style="border:none;height:1px;background:#333;margin:30px 0;">
        <p style="font-size:13px;color:#aaa;text-align:center;">
          © ${new Date().getFullYear()} OpenData Market – Mọi quyền được bảo lưu.<br/>
          Bạn nhận được email này vì đã đăng ký trên website của chúng tôi.
        </p>
      </div>
      `,
        });

        return NextResponse.json({ ok: true });
    } catch (err: any) {
        const msg = err?.issues?.[0]?.message || "Gửi email thất bại";
        return NextResponse.json({ ok: false, message: msg }, { status: 400 });
    }
}
