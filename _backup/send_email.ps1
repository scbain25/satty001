$outlook = New-Object -ComObject Outlook.Application
$mail = $outlook.CreateItem(0)
$mail.To = "john.smith@client.com"
$mail.Subject = "AI in Biopharma: A Point of View We Should Discuss"

$body = '<html><body style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1a1a1a;">'
$body += '<p>John,</p>'
$body += '<p>I hope this finds you well. I wanted to share a piece of work that I think will resonate strongly given the conversations we have been having.</p>'
$body += '<p>Attached is a Bain point of view on <b>AI in Biopharma</b> &mdash; and I will be direct: the narrative is compelling because it is uncomfortable. The central thesis is that pharma, despite being the most data-rich industry on the planet, is among the least AI-native. Not for lack of investment, but because the industry has fallen into what we call the <b>micro-productivity trap</b> &mdash; hundreds of disconnected pilots, impressive demos, but no enterprise-scale transformation.</p>'
$body += '<p>What makes this different from the usual AI-in-pharma deck:</p>'
$body += '<ul style="line-height: 1.8;">'
$body += '<li><b>It diagnoses the root causes honestly</b> &mdash; AI treated as an IT project rather than business transformation, data without governed meaning, and value chain fragmentation across R&amp;D, Manufacturing, Commercial, and Medical Affairs</li>'
$body += '<li><b>It proposes three unconventional plays</b> that no one in the industry is making today: owning the AI-mediated point of care (the Evidence Intelligence Engine), building truly autonomous clinical trials (not just AI-assisted), and creating a semantic enterprise that gives AI agents a single source of business truth</li>'
$body += '<li><b>It gets specific</b> &mdash; with hard numbers on value potential across every function and a visual blueprint of what the Clinical Development Machine of the Future actually looks like, stage by stage</li>'
$body += '</ul>'
$body += '<p>The urgency is real. AI is already reshaping point-of-care decision-making &mdash; Utah has authorized AI to prescribe routine refills, 25% of ChatGPT users submit healthcare questions weekly, and CRO partnerships with OpenAI, NVIDIA, and Palantir are fundamentally changing trial delivery. The window to act as a shaper rather than a follower is 12&ndash;18 months.</p>'
$body += '<p>I would welcome 30 minutes to walk you through the deck and discuss how this maps to your priorities. I think there is a very actionable path forward, and I would like to explore it together.</p>'
$body += '<p>Looking forward to your thoughts.</p>'
$body += '<p>Best regards</p>'
$body += '</body></html>'

$mail.HTMLBody = $body
$mail.Attachments.Add("C:\Users\75565\OneDrive - Bain\Documents\GitHub\satty001\AI_in_Biopharma_Bain_POV.pptx")
$mail.Display()
