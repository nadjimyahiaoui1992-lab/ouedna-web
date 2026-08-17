from pathlib import Path

import qrcode

url = "https://github.com/nadjimyahiaoui1992-lab/ouedna-app/releases/download/v2.1.5-admin/app-direct-release.apk"
output = Path("public/ouedna/ouedna-apk-qr.png")
output.parent.mkdir(parents=True, exist_ok=True)
image = qrcode.make(url)
image.save(output)
print(f"Generated {output} for {url}")
