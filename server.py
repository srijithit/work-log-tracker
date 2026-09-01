#!/usr/bin/env python3
"""
Work Log Tracker Server & Automated 5:00 PM Mon-Sat Email Reminder Daemon
"""

import http.server
import socketserver
import json
import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime
import threading
import time

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
CONFIG_FILE = os.path.join(DIRECTORY, 'reminder_config.json')

# Track last sent date to avoid duplicate sends on the same day
last_sent_date = None

def load_config():
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, 'r') as f:
                return json.load(f)
        except Exception as e:
            print(f"Error loading config: {e}")
    return {
        "senderEmail": "",
        "appPassword": "",
        "smtpHost": "smtp.gmail.com",
        "smtpPort": 587,
        "enabled": True,
        "memberEmails": {
            "Srijith": "srijith@example.com",
            "Sri mathi": "srimathi@example.com",
            "Akila": "akila@example.com",
            "Jayaraj": "jayaraj@example.com"
        }
    }

def save_config(cfg):
    try:
        with open(CONFIG_FILE, 'w') as f:
            json.dump(cfg, f, indent=2)
        return True
    except Exception as e:
        print(f"Error saving config: {e}")
        return False

def send_reminder_emails(recipients, config, is_test=False):
    sender = config.get("senderEmail")
    password = config.get("appPassword")
    host = config.get("smtpHost", "smtp.gmail.com")
    port = int(config.get("smtpPort", 587))

    if not sender or not password:
        return {"success": False, "error": "SMTP Sender Email and App Password must be configured."}

    valid_recipients = [r for r in recipients if r.get('email') and '@' in r.get('email')]
    if not valid_recipients:
        return {"success": False, "error": "No valid recipient email addresses provided."}

    sent_count = 0
    errors = []

    try:
        context = ssl.create_default_context()
        with smtplib.SMTP(host, port) as server:
            server.starttls(context=context)
            server.login(sender, password)

            for member in valid_recipients:
                name = member.get('name', 'Team Member')
                to_email = member.get('email')

                msg = MIMEMultipart("alternative")
                msg["Subject"] = f"{'🔔 [TEST] ' if is_test else '⏰ '}Daily Work Log Reminder - 5:00 PM"
                msg["From"] = f"Work Log Tracker <{sender}>"
                msg["To"] = to_email

                html_content = f"""
                <!DOCTYPE html>
                <html>
                <body style="font-family: Arial, sans-serif; background-color: #f8fafc; padding: 24px; color: #1e293b;">
                  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 28px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
                    <div style="text-align: center; margin-bottom: 20px;">
                      <div style="display: inline-block; background: #16a34a; color: white; border-radius: 12px; padding: 10px 14px; font-weight: bold; font-size: 16px;">
                        📋 Work Log Tracker
                      </div>
                    </div>
                    
                    <h2 style="color: #0f172a; font-size: 20px; text-align: center; margin-top: 0;">Hi {name}, it's 5:00 PM! ⏰</h2>
                    
                    <p style="font-size: 14px; line-height: 1.6; color: #475569; text-align: center;">
                      This is your daily reminder to update and submit your work tasks and project hours for today.
                    </p>
                    
                    <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin: 20px 0; text-align: center;">
                      <span style="font-size: 13px; font-weight: bold; color: #15803d;">📅 Daily Work Submission Window</span>
                      <p style="font-size: 12px; color: #166534; margin: 4px 0 0 0;">Ensure all tasks, project names, and work hours are recorded accurately.</p>
                    </div>

                    <div style="text-align: center; margin-top: 24px;">
                      <a href="http://localhost:3000" style="display: inline-block; background-color: #16a34a; color: #ffffff; text-decoration: none; padding: 12px 28px; font-size: 14px; font-weight: bold; border-radius: 10px;">
                        Open Work Log Tracker &rarr;
                      </a>
                    </div>
                    
                    <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 24px 0;">
                    
                    <p style="font-size: 11px; color: #94a3b8; text-align: center; margin: 0;">
                      Automated notification scheduled Monday to Saturday at 5:00 PM.<br>
                      Developed by <a href="https://srijith.vercel.app" style="color: #16a34a; text-decoration: none;">Srijith</a>.
                    </p>
                  </div>
                </body>
                </html>
                """
                msg.attach(MIMEText(html_content, "html"))
                server.sendmail(sender, to_email, msg.as_string())
                sent_count += 1

        return {"success": True, "sentCount": sent_count, "message": f"Successfully sent {sent_count} reminder email(s)."}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Background Automated Reminder Scheduler Thread
def reminder_scheduler_worker():
    global last_sent_date
    print("[Scheduler] Automated 5:00 PM Mon-Sat reminder background thread started.")
    
    while True:
        try:
            now = datetime.now()
            today_str = now.strftime("%Y-%m-%d")
            day_of_week = now.weekday() # Monday is 0, Saturday is 5, Sunday is 6
            hour = now.hour
            minute = now.minute

            # Check if today is Mon-Sat (0-5) and time is 17:00 (5:00 PM)
            if day_of_week in range(0, 6) and hour == 17 and minute == 0 and last_sent_date != today_str:
                print(f"[Scheduler] 5:00 PM triggered on {today_str} (Weekday {day_of_week}). Dispatching daily reminders...")
                config = load_config()
                if config.get("enabled", True):
                    member_emails = config.get("memberEmails", {})
                    recipients = [{"name": name, "email": email} for name, email in member_emails.items() if email]
                    res = send_reminder_emails(recipients, config, is_test=False)
                    print(f"[Scheduler] Result: {res}")
                last_sent_date = today_str

        except Exception as e:
            print(f"[Scheduler Error]: {e}")

        time.sleep(25) # Check every 25 seconds

class CustomHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/api/get-config':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            cfg = load_config()
            self.wfile.write(json.dumps(cfg).encode('utf-8'))
            return
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/save-config':
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body.decode('utf-8'))
                save_config(data)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": True}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

        elif self.path == '/api/send-reminder':
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body.decode('utf-8'))
                recipients = data.get('recipients', [])
                config = data.get('config', {})
                is_test = data.get('isTest', True)

                # Update saved config
                saved = load_config()
                if config.get('senderEmail'):
                    saved['senderEmail'] = config.get('senderEmail')
                if config.get('appPassword'):
                    saved['appPassword'] = config.get('appPassword')
                if config.get('smtpHost'):
                    saved['smtpHost'] = config.get('smtpHost')
                for r in recipients:
                    if r.get('name') and r.get('email'):
                        saved.setdefault('memberEmails', {})[r['name']] = r['email']
                save_config(saved)

                result = send_reminder_emails(recipients, saved, is_test=is_test)
                self.send_response(200 if result.get('success') else 400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(result).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

        elif self.path == '/api/export-docx':
            length = int(self.headers.get('content-length', 0))
            body = self.rfile.read(length)
            try:
                data = json.loads(body.decode('utf-8'))
                user_name = data.get('userName', 'ALL')
                month_str = data.get('month', '')
                tasks = data.get('tasks', [])

                from report_generator import generate_monthly_report_docx
                docx_bytes = generate_monthly_report_docx(user_name, month_str, tasks)

                clean_user = user_name.replace(' ', '_')
                clean_month = month_str if month_str else 'all_months'
                filename = f"DHIGROWTH_{clean_user}_{clean_month}_Performance_Report.docx"

                self.send_response(200)
                self.send_header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
                self.send_header('Content-Disposition', f'attachment; filename="{filename}"')
                self.send_header('Content-Length', str(len(docx_bytes)))
                self.end_headers()
                self.wfile.write(docx_bytes)
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "error": str(e)}).encode('utf-8'))
            return

        self.send_response(404)
        self.end_headers()

def main():
    # Start scheduler daemon in background thread
    scheduler_thread = threading.Thread(target=reminder_scheduler_worker, daemon=True)
    scheduler_thread.start()

    # Start HTTP Server
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), CustomHandler) as httpd:
        print(f"Server serving at http://localhost:{PORT} with Mon-Sat 5:00 PM auto reminders enabled.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass

if __name__ == '__main__':
    main()
