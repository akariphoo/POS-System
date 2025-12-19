<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class BaseController extends Controller
{
    use ApiResponse;

    // Success Response Method.
    public function sendResponse($result, string $message, $otherData = []): JsonResponse
    {
        return $this->success($result, $message, $otherData);
    }

    // Error Response Method.
    public function sendErrorResponse($result, string $message, $code = 404): JsonResponse
    {
        return $this->error($result, $message, $code);
    }

    // Service Response Method.
    public function handleServiceResponse(array $response): JsonResponse
    {
        return $this->service($response);
    }

    // Paginate Response Method.
    public function handlePaginateResponse(array $response): JsonResponse
    {
        return $this->paginate($response);
    }
}
