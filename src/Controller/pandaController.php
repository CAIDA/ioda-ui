<?php


namespace App\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class pandaController extends AbstractController
{
    /**
     * @Route("/{reactRouting}", defaults={"reactRouting": null},
     *     requirements={"reactRouting"=".+"}, methods={"GET"}, name="panda")
     *
     * @return Response
     */
    public function panda(): Response
    {
        return $this->render(
            'panda.html.twig'
        );
    }
}
