const ClientError = require('../../exceptions/ClientError');

class AuthenticationsHandler {
    constructor(authenticationsService, usersService, tokenManager, validator) {
      this._authenticationsService = authenticationsService;
      this._usersService = usersService;
      this._tokenManager = tokenManager;
      this._validator = validator;

      this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
      this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
      this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
    }

    async postAuthenticationHandler(request, h) {
        try {
            this._validator.validatePostAuthenticationPayload(request.payload);
 
            const { username, password } = request.payload;
            const id = await this._usersService.verifyUserCredential(username, password);

            //generate access token dan refresh token
            const accessToken = this._tokenManager.generateAccessToken({ id });
            const refreshToken = this._tokenManager.generateRefreshToken({ id });

            //menyimpan refresh Token ke db
            await this._authenticationsService.addRefreshToken(refreshToken);

            //response
            const res = h.response({
                status: 'success',
                message: 'Authentication berhasil ditambahkan',
                data: {
                  accessToken,
                  refreshToken,
                },
              });
            res.code(201);
            return res;
        } catch (error) {
          if (error instanceof ClientError) {
            const res = h.response({
              status: 'fail',
              message: error.message,
            });
            res.code(error.statusCode);
            return res;
          }
     
          // Server ERROR!
          const res = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
          });
          res.code(500);
          console.error(error);
          return res;
        }
    }

    async putAuthenticationHandler(request, h) {
        try {
            this._validator.validatePutAuthenticationPayload(request.payload);

            //ambil refresh token
            const { refreshToken } = request.payload;
            //verifikasi
            await this._authenticationsService.verifyRefreshToken(refreshToken);
            const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

            const accessToken = this._tokenManager.generateAccessToken({ id });
            return {
                status: 'success',
                message: 'Access Token berhasil diperbarui',
                data: {
                accessToken,
                },
            };
        } catch (error) {
          if (error instanceof ClientError) {
            const res = h.response({
              status: 'fail',
              message: error.message,
            });
            res.code(error.statusCode);
            return res;
          }
     
          // Server ERROR!
          const res = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
          });
          res.code(500);
          console.error(error);
          return res;
        }
    }

    async deleteAuthenticationHandler(request, h) {
        try {
            this._validator.validateDeleteAuthenticationPayload(request.payload);

            //ambil refresh token
            const { refreshToken } = request.payload;
            //verifikasi ke database
            await this._authenticationsService.verifyRefreshToken(refreshToken);
            //hapus token
            await this._authenticationsService.deleteRefreshToken(refreshToken);

            return {
                status: 'success',
                message: 'Refresh token berhasil dihapus',
            };
        } catch (error) {
          if (error instanceof ClientError) {
            const res = h.response({
              status: 'fail',
              message: error.message,
            });
            res.code(error.statusCode);
            return res;
          }
     
          // Server ERROR!
          const res = h.response({
            status: 'error',
            message: 'Maaf, terjadi kegagalan pada server kami.',
          });
          res.code(500);
          console.error(error);
          return res;
        }
      }

}

module.exports = AuthenticationsHandler;