<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return view('welcome');
});

// API route to get all users
Route::get('/users', [UserController::class, 'index']);