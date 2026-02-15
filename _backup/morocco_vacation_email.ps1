$outlook = New-Object -ComObject Outlook.Application
$mail = $outlook.CreateItem(0)
$mail.Subject = "Dreaming of Morocco - My Upcoming Vacation Itinerary!"

# Create temp folder for images
$tempDir = Join-Path $env:TEMP "morocco_images"
if (Test-Path $tempDir) { Remove-Item $tempDir -Recurse -Force }
New-Item -ItemType Directory -Path $tempDir | Out-Null

# Image URLs from Unsplash (freely usable, reliable CDN)
$images = @(
    @{ Name = "chefchaouen"; Url = "https://images.pexels.com/photos/3889843/pexels-photo-3889843.jpeg?auto=compress&cs=tinysrgb&w=400" },
    @{ Name = "marrakech"; Url = "https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=400&q=80" },
    @{ Name = "fes"; Url = "https://images.unsplash.com/photo-1579019163248-e7761241d85a?w=400&q=80" },
    @{ Name = "sahara"; Url = "https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=400&q=80" },
    @{ Name = "essaouira"; Url = "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=400&q=80" },
    @{ Name = "aitbenhaddou"; Url = "https://images.unsplash.com/photo-1531219572328-a0171b4448a3?w=400&q=80" },
    @{ Name = "todra"; Url = "https://images.unsplash.com/photo-1504233529578-6d46baba6d34?w=400&q=80" },
    @{ Name = "rabat"; Url = "https://images.unsplash.com/photo-1569383746724-6f1b882b8f46?w=400&q=80" },
    @{ Name = "dades"; Url = "https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80" },
    @{ Name = "tangier"; Url = "https://images.unsplash.com/photo-1545048702-79362596cdc9?w=400&q=80" }
)

# Download images with proper headers
Write-Host "Downloading images..."
$webClient = New-Object System.Net.WebClient
$webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)")

foreach ($img in $images) {
    $filePath = Join-Path $tempDir "$($img.Name).jpg"
    try {
        $webClient.DownloadFile($img.Url, $filePath)
        $size = (Get-Item $filePath).Length
        Write-Host "  Downloaded: $($img.Name) ($size bytes)"
    } catch {
        Write-Host "  FAILED: $($img.Name) - $($_.Exception.Message)"
    }
}
$webClient.Dispose()

# Build HTML body with CID references
$body = '<html><body style="font-family: Calibri, Arial, sans-serif; font-size: 11pt; color: #1a1a1a; line-height: 1.6; max-width: 700px; margin: 0 auto;">'

$body += '<h1 style="font-size: 20pt; color: #c0392b; border-bottom: 3px solid #e74c3c; padding-bottom: 8px;">Morocco Vacation - 10 Must-Visit Destinations</h1>'

$body += '<p style="font-size: 12pt;">Hi there,</p>'
$body += '<p>I am thrilled to share that I am planning a vacation to <b>Morocco</b>! It is a country that has been on my bucket list for years &mdash; the vibrant culture, stunning landscapes, ancient medinas, and incredible food. I have put together a list of the 10 places I plan to visit. Take a look!</p>'

$body += '<table style="width: 680px; border-collapse: collapse; margin: 20px 0; font-size: 10pt;">'
$body += '<tr style="background-color: #c0392b; color: white;">'
$body += '<th style="padding: 8px 10px; text-align: left; border: 1px solid #a93226; width: 18%;">Place</th>'
$body += '<th style="padding: 8px 10px; text-align: left; border: 1px solid #a93226; width: 52%;">What Makes It Cool</th>'
$body += '<th style="padding: 8px 10px; text-align: center; border: 1px solid #a93226; width: 30%;">Snapshot</th>'
$body += '</tr>'

$places = @(
    @{ Name = "Chefchaouen"; CID = "chefchaouen"; Desc = 'Known as the &ldquo;Blue Pearl of Morocco,&rdquo; this mountain town is famous for its striking blue-washed buildings cascading down the Rif Mountains. Every alley is a photo opportunity, and the relaxed vibe is the perfect antidote to city life.' },
    @{ Name = "Marrakech"; CID = "marrakech"; Desc = 'The &ldquo;Red City&rdquo; is a sensory overload in the best way &mdash; bustling souks, snake charmers in Jemaa el-Fnaa square, exquisite riads, and the stunning Majorelle Garden. It is Morocco&rsquo;s cultural heartbeat.' },
    @{ Name = "Fes"; CID = "fes"; Desc = 'Home to the world&rsquo;s oldest university (al-Qarawiyyin, founded 859 AD) and the largest car-free urban zone on Earth. The medieval medina is a labyrinth of 9,000+ alleyways, and the iconic leather tanneries are unforgettable.' },
    @{ Name = "Sahara Desert (Merzouga)"; CID = "sahara"; Desc = 'The towering Erg Chebbi sand dunes rise up to 150 meters high and glow orange at sunrise. A camel trek followed by a night under a blanket of stars in a Berber camp is a once-in-a-lifetime experience.' },
    @{ Name = "Essaouira"; CID = "essaouira"; Desc = 'A laid-back coastal gem with Portuguese-era ramparts, a bustling fishing port, and year-round Atlantic winds that make it a world-class kitesurfing destination. Jimi Hendrix once called this place home.' },
    @{ Name = "A&iuml;t Benhaddou"; CID = "aitbenhaddou"; Desc = 'This UNESCO World Heritage fortified village looks straight out of a movie &mdash; because it is. Filming location for <i>Gladiator</i>, <i>Game of Thrones</i>, and <i>Lawrence of Arabia</i>. The earthen clay architecture is breathtaking.' },
    @{ Name = "Todra Gorge"; CID = "todra"; Desc = 'Massive limestone canyon walls tower 300 meters on either side, narrowing to just 10 meters apart at the tightest point. It is a rock-climbing paradise and one of the most dramatic natural landscapes in North Africa.' },
    @{ Name = "Rabat"; CID = "rabat"; Desc = 'Morocco&rsquo;s elegant capital blends French colonial architecture with ancient ruins. The Hassan Tower, the Royal Mausoleum, and the Kasbah of the Udayas overlooking the Atlantic are stunning &mdash; and far less hectic than Marrakech.' },
    @{ Name = "Dades Valley"; CID = "dades"; Desc = 'Nicknamed the &ldquo;Valley of a Thousand Kasbahs,&rdquo; it features surreal rock formations, winding mountain roads with hairpin turns, and ancient fortresses dotting rose-filled valleys. In spring, the region blooms pink during the Rose Festival.' },
    @{ Name = "Tangier"; CID = "tangier"; Desc = 'Sitting where Africa meets Europe and the Atlantic meets the Mediterranean, Tangier has a bohemian soul. It inspired Paul Bowles and William Burroughs. The Caves of Hercules offer views of two continents at once.' }
)

$rowIndex = 0
foreach ($place in $places) {
    $bgColor = if ($rowIndex % 2 -eq 0) { "#fdf2f2" } else { "#ffffff" }
    $body += "<tr style=`"background-color: $bgColor;`">"
    $body += "<td style=`"padding: 8px 10px; border: 1px solid #ddd; font-weight: bold; color: #2c3e50;`">$($place.Name)</td>"
    $body += "<td style=`"padding: 8px 10px; border: 1px solid #ddd;`">$($place.Desc)</td>"
    $body += "<td style=`"padding: 8px 10px; border: 1px solid #ddd; text-align: center;`"><img src=`"cid:$($place.CID)`" style=`"width: 140px; max-width: 100%; border-radius: 4px;`"></td>"
    $body += "</tr>"
    $rowIndex++
}

$body += '</table>'

$body += '<p>I honestly cannot decide which one I am most excited about &mdash; the blue streets of Chefchaouen, sleeping under the stars in the Sahara, or getting lost in the ancient medina of Fes. Morocco seems like a place that will completely rewire how I think about travel.</p>'
$body += '<p>If you have been to any of these places or have tips, I would love to hear them!</p>'
$body += '<p style="margin-top: 25px;">Warm regards,<br><b>Satty</b></p>'

$body += '</body></html>'

$mail.HTMLBody = $body

# Attach images as embedded (linked) resources using Content-ID
Write-Host "Embedding images into email..."
$olByValue = 1
foreach ($img in $images) {
    $filePath = Join-Path $tempDir "$($img.Name).jpg"
    if (Test-Path $filePath) {
        $attachment = $mail.Attachments.Add($filePath, $olByValue)
        # Set the Content-ID MAPI property (PR_ATTACH_CONTENT_ID)
        $attachment.PropertyAccessor.SetProperty("http://schemas.microsoft.com/mapi/proptag/0x3712001F", $img.Name)
        Write-Host "  Embedded: $($img.Name)"
    } else {
        Write-Host "  SKIPPED (not found): $($img.Name)"
    }
}

Write-Host "Opening email..."
$mail.Display()
Write-Host "Done! Email opened in Outlook."
