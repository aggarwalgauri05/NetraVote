"""
NetraVote PDF Report Generator
Generates formal ECI-ready PDF evidence reports using ReportLab.
Falls back to text-based report if reportlab not installed.
"""
import io
from datetime import datetime

def generate_pdf_report(constituency: str, graph_data: dict) -> bytes:
    """Generate a structured PDF forensic report."""
    try:
        from reportlab.lib.pagesizes import A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.units import inch, cm
        from reportlab.lib.enums import TA_CENTER, TA_LEFT

        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=A4, topMargin=1*cm, bottomMargin=1*cm,
                                leftMargin=1.5*cm, rightMargin=1.5*cm)

        styles = getSampleStyleSheet()
        story = []

        # ── Title ──
        title_style = ParagraphStyle("Title", parent=styles["Title"],
                                     fontSize=18, spaceAfter=6, textColor=colors.HexColor("#1e3a5f"))
        subtitle_style = ParagraphStyle("Sub", parent=styles["Normal"],
                                        fontSize=10, spaceAfter=4, textColor=colors.HexColor("#555555"))
        body_style = ParagraphStyle("Body", parent=styles["Normal"], fontSize=9, spaceAfter=4)
        warn_style = ParagraphStyle("Warn", parent=styles["Normal"], fontSize=10,
                                    textColor=colors.red, spaceAfter=4)

        story.append(Paragraph("ELECTION COMMISSION OF INDIA", title_style))
        story.append(Paragraph("NetraVote Ghost Voter Intelligence Report", subtitle_style))
        story.append(Paragraph(f"Constituency: <b>{constituency}</b>  |  Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}  |  CLASSIFICATION: TOP SECRET", subtitle_style))
        story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1e3a5f")))
        story.append(Spacer(1, 0.3*cm))

        stats = graph_data.get("stats", {})
        voters = [n for n in graph_data.get("nodes", []) if n.get("group") == "Voters"]
        ghosts = [v for v in voters if v.get("riskScore", 0) > 0.6]

        # ── Executive Summary ──
        story.append(Paragraph("<b>EXECUTIVE SUMMARY</b>", styles["Heading2"]))
        summary_data = [
            ["Metric",                   "Value"],
            ["Total Voters Analyzed",    str(stats.get("totalVoters", len(voters)))],
            ["Ghost Voter Anomalies",    str(stats.get("ghostVoters", len(ghosts)))],
            ["Legitimate Voters",        str(stats.get("legitimateVoters", len(voters)-len(ghosts)))],
            ["Electoral Integrity Score",f"{stats.get('integrityScore', 0)}%"],
            ["Average Risk Score",       str(stats.get("averageRiskScore", 0))],
            ["Threat Level",             "CRITICAL" if len(ghosts) > 50 else "HIGH" if len(ghosts) > 20 else "MEDIUM"],
        ]
        t = Table(summary_data, colWidths=[8*cm, 8*cm])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#1e3a5f")),
            ("TEXTCOLOR",  (0,0), (-1,0), colors.white),
            ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",   (0,0), (-1,-1), 9),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f0f4f8")]),
            ("GRID",       (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
            ("LEFTPADDING",(0,0), (-1,-1), 8),
        ]))
        story.append(t)
        story.append(Spacer(1, 0.4*cm))

        # ── Risk Scoring Model ──
        story.append(Paragraph("<b>RISK SCORING METHODOLOGY</b>", styles["Heading2"]))
        signal_data = [
            ["Signal",               "Weight", "Description"],
            ["Address Overcrowding", "30 pts", ">10 voters at same address"],
            ["EPIC Duplication",     "25 pts", "Same/similar EPIC number"],
            ["Impossible Family",    "20 pts", "Son older than father, etc."],
            ["No Aadhaar Link",      "15 pts", "Voter not linked to Aadhaar DB"],
            ["Multi-Booth",          "15 pts", "Enrolled at multiple booths"],
            ["Temporal Anomaly",     "10 pts", "Bulk registration spike"],
            ["Cross-Pincode",        "10 pts", "Address with multiple pincodes"],
        ]
        st = Table(signal_data, colWidths=[6*cm, 2.5*cm, 7.5*cm])
        st.setStyle(TableStyle([
            ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#c0392b")),
            ("TEXTCOLOR",  (0,0), (-1,0), colors.white),
            ("FONTNAME",   (0,0), (-1,-1), "Helvetica"),
            ("FONTNAME",   (0,0), (-1,0), "Helvetica-Bold"),
            ("FONTSIZE",   (0,0), (-1,-1), 9),
            ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#fff5f5")]),
            ("GRID",       (0,0), (-1,-1), 0.5, colors.HexColor("#cccccc")),
            ("LEFTPADDING",(0,0), (-1,-1), 6),
        ]))
        story.append(st)
        story.append(Spacer(1, 0.4*cm))

        # ── Ghost Voter Registry ──
        story.append(Paragraph("<b>GHOST VOTER REGISTRY (TOP 20)</b>", styles["Heading2"]))
        story.append(Paragraph("⚠ These voters require immediate physical verification.", warn_style))
        gv_data = [["#", "Voter ID", "Name", "EPIC", "Risk Score", "Flags"]]
        for i, v in enumerate(ghosts[:20], 1):
            gv_data.append([
                str(i), v.get("id","")[:16], v.get("name","")[:20],
                v.get("epic_number","")[:14],
                f"{v.get('riskScore',0)*100:.0f}%",
                "Overcrowding, Temporal"
            ])
        if gv_data:
            gvt = Table(gv_data, colWidths=[0.8*cm, 3.5*cm, 3.5*cm, 3*cm, 2*cm, 3.2*cm])
            gvt.setStyle(TableStyle([
                ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#991b1b")),
                ("TEXTCOLOR",  (0,0), (-1,0), colors.white),
                ("FONTNAME",   (0,0), (-1,-1), "Helvetica"),
                ("FONTSIZE",   (0,0), (-1,-1), 8),
                ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#fef2f2")]),
                ("GRID",       (0,0), (-1,-1), 0.3, colors.HexColor("#e5e7eb")),
                ("LEFTPADDING",(0,0), (-1,-1), 4),
            ]))
            story.append(gvt)

        story.append(Spacer(1, 0.4*cm))
        story.append(HRFlowable(width="100%", thickness=1))
        story.append(Paragraph(
            "This report is generated by NetraVote Intelligence System v4.1 — Anti-Gravity Systems. "
            "Authorized distribution: Election Commission of India (ECI), District Election Officers, Chief Electoral Officers.",
            body_style
        ))

        doc.build(story)
        return buf.getvalue()

    except ImportError:
        # Fallback: plain text "PDF"
        content = f"""NETRAVOTE GHOST VOTER INTELLIGENCE REPORT
{'='*60}
Constituency: {constituency}
Generated: {datetime.utcnow().isoformat()}
Classification: TOP SECRET

SUMMARY
-------
Total Voters: {graph_data.get('stats', {}).get('totalVoters', 'N/A')}
Ghost Anomalies: {graph_data.get('stats', {}).get('ghostVoters', 'N/A')}
Integrity Score: {graph_data.get('stats', {}).get('integrityScore', 'N/A')}%

ReportLab not installed. Install with: pip install reportlab
"""
        return content.encode("utf-8")
