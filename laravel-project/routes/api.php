<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

// API route to get all users
Route::get('/users', [UserController::class, 'index']);
