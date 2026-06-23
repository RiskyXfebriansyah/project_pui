using IoTManagerAPI.Model;
using IoTManagerAPI.Model.Posyandu;
using IoTManagerAPI.Repository.Implements;
using IoTManagerAPI.Repository.Implements.Posyandu;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IoTManagerAPI.Controllers.Posyandu
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class PenggunaController : ControllerBase
    {
        private readonly IConfiguration _config;

        public PenggunaController(IConfiguration config)
        {
            _config = config;
        }

        // ── GET api/Pengguna/GetAll ────────────────────────────────
        [HttpGet("GetAll")]
        public async Task<ActionResult> GetAll()
        {
            try
            {
                using var context = new DapperContext("PSG", "Posyandu");
                var userRepo = new UsersPosRepository(context);
                var result = (await userRepo.GetAllAsync()).ToList();

                return Ok(new { status = StTrans.SetStatus(200, result.Count, "Success"), data = result });
            }
            catch (Exception ex)
            {
                return Ok(new { status = StTrans.SetStatus(400, 0, ex.Message), data = new List<UsersPos>() });
            }
        }

        // ── GET api/Pengguna/GetByRole?role=orang_tua ─────────────
        [HttpGet("GetByRole")]
        public async Task<ActionResult> GetByRole(string role)
        {
            try
            {
                using var context = new DapperContext("PSG", "Posyandu");
                var userRepo = new UsersPosRepository(context);
                var result = (await userRepo.GetByRoleAsync(role)).ToList();

                return Ok(new { status = StTrans.SetStatus(200, result.Count, "Success"), data = result });
            }
            catch (Exception ex)
            {
                return Ok(new { status = StTrans.SetStatus(400, 0, ex.Message), data = new List<UsersPos>() });
            }
        }

        // ── GET api/Pengguna/GetById?id=1 ─────────────────────────
        [HttpGet("GetById")]
        public async Task<ActionResult> GetById(int id)
        {
            try
            {
                using var context = new DapperContext("PSG", "Posyandu");
                var userRepo = new UsersPosRepository(context);
                var result = await userRepo.GetByIdAsync(id);

                if (result == null)
                    return Ok(new { status = StTrans.SetStatus(404, 0, "Data tidak ditemukan"), data = (object)null });

                return Ok(new { status = StTrans.SetStatus(200, 1, "Success"), data = result });
            }
            catch (Exception ex)
            {
                return Ok(new { status = StTrans.SetStatus(400, 0, ex.Message), data = (object)null });
            }
        }

        // ── POST api/Pengguna/Create — hanya admin ─────────────────
        [HttpPost("Create")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> Create([FromBody] UsersPos dto)
        {
            try
            {
                using var context = new DapperContext("PSG", "Posyandu");
                var userRepo = new UsersPosRepository(context);
                var newId = await userRepo.CreateAsync(dto);

                return Ok(new { status = StTrans.SetStatus(200, 1, "Pengguna berhasil dibuat"), data = new { id = newId } });
            }
            catch (Exception ex)
            {
                return Ok(new { status = StTrans.SetStatus(400, 0, ex.Message), data = (object)null });
            }
        }

        // ── POST api/Pengguna/CreateOrtu — hanya admin ─────────────
        [HttpPost("CreateOrtu")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> CreateOrtu([FromBody] CreateOrtuDTO dto)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(dto.Nama))
                    return Ok(new { status = StTrans.SetStatus(400, 0, "Nama orang tua wajib diisi"), data = (object)null });

                if (string.IsNullOrWhiteSpace(dto.Email))
                    return Ok(new { status = StTrans.SetStatus(400, 0, "Email wajib diisi"), data = (object)null });

                using var context = new DapperContext("PSG", "Posyandu");
                var userRepo = new UsersPosRepository(context);
                var result = await userRepo.CreateOrtuWithBalitaAsync(dto);

                var message = result.BalitaId.HasValue
                    ? $"Akun orang tua & data balita berhasil dibuat (BalitaId: {result.BalitaId})"
                    : "Akun orang tua berhasil dibuat";

                return Ok(new
                {
                    status = StTrans.SetStatus(200, 1, message),
                    data   = new { message, userId = result.UserId, balitaId = result.BalitaId }
                });
            }
            catch (Exception ex)
            {
                return Ok(new { status = StTrans.SetStatus(400, 0, ex.Message), data = (object)null });
            }
        }

        // ── PUT api/Pengguna/ToggleAktif?id=1&aktif=false ─────────
        [HttpPut("ToggleAktif")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> ToggleAktif(int id, bool aktif)
        {
            try
            {
                using var context = new DapperContext("PSG", "Posyandu");
                var userRepo = new UsersPosRepository(context);
                var ok = await userRepo.UpdateAktifAsync(id, aktif);
                var msg = aktif ? "Akun diaktifkan" : "Akun dinonaktifkan";

                return Ok(new { status = StTrans.SetStatus(ok ? 200 : 404, ok ? 1 : 0, msg) });
            }
            catch (Exception ex)
            {
                return Ok(new { status = StTrans.SetStatus(400, 0, ex.Message) });
            }
        }

        // ── DELETE api/Pengguna/Delete?id=1 — hanya admin ─────────
        [HttpDelete("Delete")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult> Delete(int id)
        {
            try
            {
                using var context = new DapperContext("PSG", "Posyandu");
                var userRepo = new UsersPosRepository(context);
                var ok = await userRepo.DeleteAsync(id);

                return Ok(new { status = StTrans.SetStatus(ok ? 200 : 404, ok ? 1 : 0, ok ? "Berhasil dihapus" : "Data tidak ditemukan") });
            }
            catch (Exception ex)
            {
                return Ok(new { status = StTrans.SetStatus(400, 0, ex.Message) });
            }
        }

        // ── POST api/Pengguna/GantiPassword ───────────────────────
        [HttpPost("GantiPassword")]
        public async Task<ActionResult> GantiPassword([FromBody] GantiPasswordDTO dto)
        {
            try
            {
                var userIdClaim = User.FindFirst("id")?.Value;
                if (string.IsNullOrEmpty(userIdClaim))
                    return Ok(new { status = StTrans.SetStatus(401, 0, "Token tidak valid") });

                var userId = int.Parse(userIdClaim);

                if (string.IsNullOrWhiteSpace(dto.PasswordLama))
                    return Ok(new { status = StTrans.SetStatus(400, 0, "Password lama wajib diisi") });

                if (string.IsNullOrWhiteSpace(dto.PasswordBaru))
                    return Ok(new { status = StTrans.SetStatus(400, 0, "Password baru wajib diisi") });

                if (dto.PasswordBaru.Length < 6)
                    return Ok(new { status = StTrans.SetStatus(400, 0, "Password baru minimal 6 karakter") });

                if (dto.PasswordBaru != dto.KonfirmasiPassword)
                    return Ok(new { status = StTrans.SetStatus(400, 0, "Konfirmasi password tidak cocok") });

                if (dto.PasswordLama == dto.PasswordBaru)
                    return Ok(new { status = StTrans.SetStatus(400, 0, "Password baru tidak boleh sama dengan password lama") });

                using var context = new DapperContext("PSG", "Posyandu");
                var userRepo = new UsersPosRepository(context);
                var ok = await userRepo.UpdatePasswordAsync(userId, dto.PasswordLama, dto.PasswordBaru);

                if (!ok)
                    return Ok(new { status = StTrans.SetStatus(400, 0, "Password lama salah") });

                return Ok(new { status = StTrans.SetStatus(200, 1, "Password berhasil diubah") });
            }
            catch (Exception ex)
            {
                return Ok(new { status = StTrans.SetStatus(400, 0, ex.Message) });
            }
        }
    }
}