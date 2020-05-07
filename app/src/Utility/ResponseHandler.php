<?php

namespace Ps2alerts\Api\Utility;

use League\Fractal\TransformerAbstract;
use Ps2alerts\Api\Contract\EndpointInterface;
use Ps2alerts\Api\Contract\FractalAwareInterface;
use Ps2alerts\Api\Contract\FractalAwareTrait;
use Ps2alerts\Api\Contract\UtilityAwareInterface;
use Ps2alerts\Api\Contract\UtilityAwareTrait;
use Psr\Http\Message\ResponseInterface;
use Ps2alerts\Api\Contract\HttpMessageAwareInterface;
use Ps2alerts\Api\Contract\HttpMessageAwareTrait;

abstract class ResponseHandler implements
    FractalAwareInterface,
    EndpointInterface,
    HttpMessageAwareInterface,
    UtilityAwareInterface
{
    use FractalAwareTrait;
    use HttpMessageAwareTrait;
    use UtilityAwareTrait;

    const CODE_WRONG_ARGS     = 'API-MALFORMED-REQUEST';
    const CODE_NOT_FOUND      = 'API-NOT-FOUND';
    const CODE_INTERNAL_ERROR = 'API-DOH';
    const CODE_EXTERNAL_ERROR = 'API-NOT-MY-PROBLEM';
    const CODE_UNAUTHORIZED   = 'API-UNAUTHORIZED';
    const CODE_FORBIDDEN      = 'API-DENIED';
    const CODE_EMPTY          = 'API-EMPTY';

    /**
     * Stores the status code
     *
     * @var integer
     */
    protected $statusCode = 200;

    /**
     * Flag whether to send back a "is cached" header
     *
     * @var boolean
     */
    protected $sendCachedHeader = false;

    /**
     * Getter for statusCode
     *
     * @return int
     */
    public function getStatusCode()
    {
        return $this->statusCode;
    }

    /**
     * Setter for statusCode
     *
     * @param integer $statusCode Value to set
     *
     * @return self
     */
    public function setStatusCode(int $statusCode)
    {
        $this->statusCode = (int) $statusCode;
        return $this;
    }

    /**
     * Master function to split out appropriate calls
     *
     * @param  string              $kind     The kind of data we wish to return
     * @param  array               $data     The data itself
     * @param  TransformerAbstract $transformer The transformer class to call
     *
     * @return ResponseInterface
     */
    public function respond(string $kind, array $data, TransformerAbstract $transformer)
    {
        // Detect what embeds we need
        if (!empty($_GET['embed'])) {
            $this->getFractalManager()->parseIncludes($_GET['embed']);
        }

        switch ($kind) {
            case 'item':
                return $this->respondWithItem($data, $transformer);
            case 'collection':
                return $this->respondWithCollection($data, $transformer);
            default:
                return $this->respondWithError('No Response was defined. Please report this!', self::CODE_INTERNAL_ERROR);
        }
    }

    /**
     * Builds an item response in Fractal then hands off to the responder
     *
     * @param  array               $item        The item to transform
     * @param  TransformerAbstract $transformer The Transformer to pass through to Fractal
     *
     * @return ResponseInterface
     */
    public function respondWithItem(array $item, TransformerAbstract $transformer)
    {
        return $this->respondWithData($this->getFractalUtility()->createItem($item, $transformer));
    }

    /**
     * Builds a collection of items from Fractal then hands off to the responder
     *
     * @param  array               $collection  The collection to transform
     * @param  TransformerAbstract $transformer The Transformer to pass through to Fractal
     *
     * @return ResponseInterface
     */
    public function respondWithCollection(array $collection, TransformerAbstract $transformer)
    {
        return $this->respondWithData($this->getFractalUtility()->createCollection($collection, $transformer));
    }

    /**
     * Responds gracefully with an error.
     *
     * @param  string $message   Response message to put in the error
     * @param  int    $code Error code to set
     *
     * @return ResponseInterface
     */
    public function respondWithError(string $message, $code)
    {
        switch ($code) {
            case self::CODE_WRONG_ARGS:
                $this->setStatusCode(400);
                break;
            case self::CODE_UNAUTHORIZED:
                $this->setStatusCode(401);
                break;
            case self::CODE_FORBIDDEN:
                $this->setStatusCode(403);
                break;
            case self::CODE_EMPTY:
            case self::CODE_NOT_FOUND:
                $this->setStatusCode(404);
                break;
            case self::CODE_INTERNAL_ERROR:
            case self::CODE_EXTERNAL_ERROR:
                $this->setStatusCode(500);
                break;
        }
        
        if ($this->getStatusCode() === 200) {
            trigger_error(
                '200 code sent when we\'re attempting to respond with an error!',
                E_USER_ERROR
            );
        }

        // Pass to responder
        return $this->respondWithData([
            'error' => [
                'code' => $code,
                'http_code' => $this->getStatusCode(),
                'message' => $message,
            ]
        ]);
    }

    /**
     * The final step where the formatted array is now sent back as a response in JSON form
     *
     * @param  array $data
     *
     * @return ResponseInterface
     */
    public function respondWithData(array $data)
    {
        $response = $this->getResponse();

        $response->getBody()->write(json_encode($data));

        $response = $response->withStatus($this->getStatusCode());
        $response = $response->withHeader('Content-Type', 'application/json');
        $response = $response->withHeader('X-Redis-Cache-Status', $this->getRedisUtility()->getFlag());
        $response = $response->withHeader('X-Redis-Cache-Hits', $this->getRedisUtility()->getHitCount());
        $response = $response->withHeader('X-Redis-Cache-Misses', $this->getRedisUtility()->getMissCount());

        // This is the end of the road. FIRE ZE RESPONSE!
        return $response;
    }
}