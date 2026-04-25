# Echo Server Lookup

Platform analytics server Minecraft dengan desain Luxury Dark Glassmorphism, integrasi WHOIS Network Infrastructure, dan Connection Analysis.

## Fitur Utama

### 6 Main Cards Dashboard
1. **Players** - Player count dengan progress bar & avatar grid (minotar.net)
2. **Network** - IP Address, Port, Hostname dengan click-to-copy
3. **Your Latency** - Latensi lokal (Hijau <80ms, Kuning 80-160ms, Merah >160ms)
4. **Network Infrastructure** - ISP, Organization, ASN, Location, Reverse DNS
5. **Connection Analysis** - Routing Quality (Direct/Proxy/Intercontinental) & Security Level
6. **Server Info** - Version, Software (dengan branding icon), Gamemode, Map, EULA Status

### Fitur Lainnya
- **Dual-API Integration** - MCSrvStat (Minecraft) + IP-API (WHOIS/Network)
- **MOTD Renderer** - Parsing § color codes menjadi format web yang elegan
- **Search History** - Simpan 10 IP terakhir di session browser
- **Copy to Clipboard** - Satu klik untuk copy IP address
- **Glassmorphism UI** - Desain luxury dark theme dengan efek blur
- **Responsive** - Tampilan optimal di desktop dan mobile
- **Performance Optimized** - Cache 60 detik (Minecraft) & 5 menit (WHOIS)

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion
- **Icons:** Lucide React
- **Type Safety:** TypeScript
- **Font:** Inter & JetBrains Mono

## Cara Menjalankan

```bash
# Install dependencies
bun install

# Run development server
bun run dev

# Build untuk production
bun run build

# Start production server
bun run start
```

## Deployment ke Vercel

1. Push project ke GitHub
2. Import repository di [Vercel](https://vercel.com/new)
3. Deploy - selesai!

## API Sources

- **Minecraft Data:** [MCSrvStat](https://api.mcsrvstat.us/) API v3
- **WHOIS/Network Data:** [IP-API](http://ip-api.com/) JSON API

## Logic Flow

1. User memasukkan domain/IP server Minecraft
2. App melakukan fetch ke MCSrvStat untuk mendapatkan data server & IP asli
3. App melakukan fetch kedua ke IP-API menggunakan IP asli untuk mendapatkan data WHOIS
4. App menganalisis Connection Quality berdasarkan jarak lokasi (Haversine formula)
5. App menganalisis Security Level (DDoS protection, custom port, proxy software)
6. Kedua data digabungkan dalam satu dashboard "Echo Server Lookup" dengan 6 cards simetris

## Technical Details

- **Grouped Debug Info:** Protocols (Ping, Query, SRV), Network (DNS, CNAME)
- **Clean Rendering:** Object values dirender sebagai key-value list (bukan `[object Object]`)
- **Filtered Data:** Menyembunyikan cache/api version info dari user

---

**Optimized for latency and performance. Powered by EchoAgent Core.**
