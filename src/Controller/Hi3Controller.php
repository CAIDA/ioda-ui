<?php


namespace App\Controller;


use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class Hi3Controller extends AbstractController
{
    /**
     * @Route("/{reactRouting}", defaults={"reactRouting": null},
     *     requirements={"reactRouting"=".+"}, methods={"GET"}, name="hi3")
     *
     * @return Response
     */
    public function hi3(): Response
    {
        return $this->render(
            'hi3.html.twig'
        );
    }
}
