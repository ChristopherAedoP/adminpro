import * as swal from 'sweetalert';
import { Usuario } from './../../models/usuario.model';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { URL_SERVICIOS } from '../../config/config';
import 'rxjs/add/operator/map';
import { Router } from '@angular/router';
import { SubirArchivoService } from '../subir-archivo/subir-archivo.service';

@Injectable()
export class UsuarioService {
  usuario: Usuario;
  token: string;

  constructor(
    public _router: Router,
    public _http: HttpClient,
    public _sas: SubirArchivoService
  ) {
    this.cargarDelStorage();
  }
  guardarStorage(id: string, token: string, usuario: Usuario) {
    localStorage.setItem('id', id);
    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));

    this.usuario = usuario;
    this.token = token;
  }

  login(usuario: Usuario, recordar: boolean = false) {
    if (recordar) {
      localStorage.setItem('email', usuario.email);
    } else {
      localStorage.removeItem('email');
    }

    let url = URL_SERVICIOS + `/login`;

    return this._http.post(url, usuario).map((resp: any) => {
      this.guardarStorage(resp.id, resp.token, resp.usuario);
      return true;
    });
  }

  loginGoogle(token) {
    let url = URL_SERVICIOS + `/login/google`;

    return this._http.post(url, { token }).map((resp: any) => {
      this.guardarStorage(resp.id, resp.token, resp.usuario);
      return true;
    });
  }

  estaLogueado() {
    return this.token.length > 5 ? true : false;
  }

  cargarDelStorage() {
    if (localStorage.getItem('token')) {
      this.usuario = JSON.parse(localStorage.getItem('usuario'));
      this.token = localStorage.getItem('token');
    } else {
      this.usuario = null;
      this.token = '';
    }
  }
  logout() {
    this.usuario = null;
    this.token = '';

    localStorage.removeItem('id');
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');

    this._router.navigate(['/login']);
  }

  crearUsuario(usuario: Usuario) {
    let url = URL_SERVICIOS + `/usuario`;

    return this._http.post(url, usuario).map((resp: any) => {
      swal('Usuario creado', usuario.email, 'success');
      return resp.usuario;
    });
  }
  actualizarUsuario(usuario: Usuario) {
    let url = URL_SERVICIOS + `/usuario/${usuario._id}?token=${this.token}`;

    return this._http.put(url, usuario).map((res: any) => {
      let usuarioDB: Usuario = res.usuario;

      this.guardarStorage(usuarioDB._id, this.token, usuarioDB);
      swal('Usuario actualizado', usuario.nombre, 'success');
      this.guardarStorage(usuarioDB._id, this.token, usuarioDB);
      return true;
    });
  }

  cambiarImagen(archivo: File, id: string) {
    this._sas
      .subirArchivo(archivo, 'usuarios', id)
      .then((resp: any) => {
        this.usuario.img = resp.usuario.img;
        swal('Imagen Actualizada', this.usuario.nombre, 'success');
        this.guardarStorage(id, this.token, this.usuario);
      })
      .catch(resp => {
        console.log('err', resp);
      });
  }
}
