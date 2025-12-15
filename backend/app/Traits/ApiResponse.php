<?php

namespace App\Traits\Api;
use Illuminate\Http\JsonResponse;

trait ApiResponse
{
    // Success
    public function success($result, string $message, array $otherData = []): JsonResponse
    {
        $response = [
            'status' => (boolean) true,
            'message' => (string) $message,
        ];

        $response = !empty($otherData) ? array_merge($response,$otherData) : $response;
        $response['data'] = $result;
        return response()->json($response, 200);
    }

     // Error
     public function error($result,string $message, $code = 404): JsonResponse
     {
         $response = [
             'status' => (boolean) false,
             'message' => (string) $message,
             'errors'    => $result,
         ];

         return response()->json($response, $code);
     }

    // Service Response
    public function service(array $response): JsonResponse
    {
        [$status, $message, $result, $code] = $response;

        if ($status) {
            return $this->success($result, $message);
        }

        return $this->error($result, $message, $code);
    }

    // Paginate Response
    public function paginate(array $response): JsonResponse
    {
        [$status, $message, $result,$other_data, $code] = $response;

        if ($status) {
            return $this->success($result, $message,$other_data);
        }

        return $this->error($result, $message, $code);
    }
}
